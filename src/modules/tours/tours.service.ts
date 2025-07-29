import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tour } from './entities/tour.entity';
import { TourCategory } from './entities/tour-category.entity';
import { TourItinerary } from './entities/tour-itinerary.entity';
import { TourPrice } from './entities/tour-price.entity';
import { TourAvailability } from './entities/tour-availability.entity';
import { TourImage } from './entities/tour-image.entity';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { CreateTourCategoryDto } from './dto/create-tour-category.dto';
import { UpdateTourCategoryDto } from './dto/update-tour-category.dto';

@Injectable()
export class ToursService {
  constructor(
    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
    @InjectRepository(TourCategory)
    private readonly tourCategoryRepository: Repository<TourCategory>,
    @InjectRepository(TourItinerary)
    private readonly tourItineraryRepository: Repository<TourItinerary>,
    @InjectRepository(TourPrice)
    private readonly tourPriceRepository: Repository<TourPrice>,
    @InjectRepository(TourAvailability)
    private readonly tourAvailabilityRepository: Repository<TourAvailability>,
    @InjectRepository(TourImage)
    private readonly tourImageRepository: Repository<TourImage>,
  ) {}

  // Tour Categories
  async createCategory(createTourCategoryDto: CreateTourCategoryDto): Promise<TourCategory> {
    const category = this.tourCategoryRepository.create(createTourCategoryDto);
    return await this.tourCategoryRepository.save(category);
  }

  async findAllCategories(): Promise<TourCategory[]> {
    return await this.tourCategoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
      relations: ['tours']
    });
  }

  async findCategoryById(id: number): Promise<TourCategory> {
    const category = await this.tourCategoryRepository.findOne({
      where: { id, isActive: true },
      relations: ['tours']
    });
    
    if (!category) {
      throw new NotFoundException(`Tour category with ID ${id} not found`);
    }
    
    return category;
  }

  async updateCategory(id: number, updateTourCategoryDto: UpdateTourCategoryDto): Promise<TourCategory> {
    const category = await this.findCategoryById(id);
    Object.assign(category, updateTourCategoryDto);
    return await this.tourCategoryRepository.save(category);
  }

  async removeCategory(id: number): Promise<void> {
    const category = await this.findCategoryById(id);
    category.isActive = false;
    await this.tourCategoryRepository.save(category);
  }

  // Tours
  async create(createTourDto: CreateTourDto): Promise<Tour> {
    // Verify category exists
    await this.findCategoryById(createTourDto.categoryId);
    
    const tour = this.tourRepository.create({
      ...createTourDto,
      category: { id: createTourDto.categoryId }
    });
    
    return await this.tourRepository.save(tour);
  }

  async findAll(): Promise<Tour[]> {
    return await this.tourRepository.find({
      where: { isActive: true },
      relations: ['category', 'images', 'prices', 'availability'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Tour> {
    const tour = await this.tourRepository.findOne({
      where: { id, isActive: true },
      relations: ['category', 'itinerary', 'prices', 'availability', 'images']
    });
    
    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }
    
    return tour;
  }

  async update(id: number, updateTourDto: UpdateTourDto): Promise<Tour> {
    const tour = await this.findOne(id);
    
    // If categoryId is being updated, verify it exists
    if (updateTourDto.categoryId && updateTourDto.categoryId !== tour.category.id) {
      await this.findCategoryById(updateTourDto.categoryId);
      updateTourDto['category'] = { id: updateTourDto.categoryId };
    }
    
    Object.assign(tour, updateTourDto);
    return await this.tourRepository.save(tour);
  }

  async remove(id: number): Promise<void> {
    const tour = await this.findOne(id);
    tour.isActive = false;
    await this.tourRepository.save(tour);
  }

  // Tour search and filtering
  async findByCategory(categoryId: number): Promise<Tour[]> {
    return await this.tourRepository.find({
      where: { 
        category: { id: categoryId },
        isActive: true 
      },
      relations: ['category', 'images', 'prices'],
      order: { rating: 'DESC', createdAt: 'DESC' }
    });
  }

  async searchTours(searchTerm: string): Promise<Tour[]> {
    return await this.tourRepository
      .createQueryBuilder('tour')
      .leftJoinAndSelect('tour.category', 'category')
      .leftJoinAndSelect('tour.images', 'images', 'images.isActive = :active', { active: true })
      .where('tour.isActive = :active', { active: true })
      .andWhere(
        '(tour.name LIKE :search OR tour.description LIKE :search OR tour.startLocation LIKE :search OR tour.endLocation LIKE :search)',
        { search: `%${searchTerm}%` }
      )
      .orderBy('tour.rating', 'DESC')
      .addOrderBy('tour.createdAt', 'DESC')
      .getMany();
  }
}