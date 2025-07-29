import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from './entities/hotel.entity';
import { RoomType } from './entities/room-type.entity';
import { RoomPrice } from './entities/room-price.entity';
import { RoomInventory } from './entities/room-inventory.entity';
import { HotelImage } from './entities/hotel-image.entity';
import { RoomImage } from './entities/room-image.entity';
import { Room } from './entities/room.entity';
import { HotelType } from './entities/hotel-type.entity';
import { HotelFeature } from './entities/hotel-feature.entity';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { CreateHotelImageDto } from './dto/create-hotel-image.dto';
import { CreateHotelTypeDto } from './dto/create-hotel-type.dto';
import { UpdateHotelTypeDto } from './dto/update-hotel-type.dto';
import { CreateHotelFeatureDto } from './dto/create-hotel-feature.dto';
import { UpdateHotelFeatureDto } from './dto/update-hotel-feature.dto';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    @InjectRepository(RoomType)
    private roomTypeRepository: Repository<RoomType>,
    @InjectRepository(RoomPrice)
    private roomPriceRepository: Repository<RoomPrice>,
    @InjectRepository(RoomInventory)
    private roomInventoryRepository: Repository<RoomInventory>,
    @InjectRepository(HotelImage)
    private hotelImageRepository: Repository<HotelImage>,
    @InjectRepository(RoomImage)
    private roomImageRepository: Repository<RoomImage>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(HotelType)
    private hotelTypeRepository: Repository<HotelType>,
    @InjectRepository(HotelFeature)
    private hotelFeatureRepository: Repository<HotelFeature>,
  ) {}

  // Hotel Features
  async createHotelFeature(createHotelFeatureDto: CreateHotelFeatureDto): Promise<HotelFeature> {
    const feature = this.hotelFeatureRepository.create(createHotelFeatureDto);
    return await this.hotelFeatureRepository.save(feature);
  }

  async findAllHotelFeatures(): Promise<HotelFeature[]> {
    return await this.hotelFeatureRepository.find({
      where: { isActive: true },
      order: { category: 'ASC', name: 'ASC' }
    });
  }

  async findHotelFeaturesByCategory(category: string): Promise<HotelFeature[]> {
    return await this.hotelFeatureRepository.find({
      where: { category, isActive: true },
      order: { name: 'ASC' }
    });
  }

  async findHotelFeatureById(id: number): Promise<HotelFeature> {
    const feature = await this.hotelFeatureRepository.findOne({
      where: { id, isActive: true }
    });
    
    if (!feature) {
      throw new Error(`Hotel feature with ID ${id} not found`);
    }
    
    return feature;
  }

  async updateHotelFeature(id: number, updateHotelFeatureDto: UpdateHotelFeatureDto): Promise<HotelFeature> {
    const feature = await this.findHotelFeatureById(id);
    Object.assign(feature, updateHotelFeatureDto);
    return await this.hotelFeatureRepository.save(feature);
  }

  async removeHotelFeature(id: number): Promise<void> {
    const feature = await this.findHotelFeatureById(id);
    feature.isActive = false;
    await this.hotelFeatureRepository.save(feature);
  }

  // Assign features to hotel using JSON array
  async assignFeaturesToHotel(hotelId: number, featureIds: number[]): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: { id: hotelId }
    });
    
    if (!hotel) {
      throw new Error(`Hotel with ID ${hotelId} not found`);
    }

    // Validate that all feature IDs exist
    const features = await this.hotelFeatureRepository.find({
      where: { isActive: true }
    });
    
    const validFeatureIds = features.map(f => f.id);
    const invalidIds = featureIds.filter(id => !validFeatureIds.includes(id));
    
    if (invalidIds.length > 0) {
      throw new Error(`Invalid feature IDs: ${invalidIds.join(', ')}`);
    }

    hotel.features = featureIds;
    return await this.hotelRepository.save(hotel);
  }

  // Assign features to hotel type using JSON array
  async assignFeaturesToHotelType(hotelTypeId: number, featureIds: number[]): Promise<HotelType> {
    const hotelType = await this.hotelTypeRepository.findOne({
      where: { id: hotelTypeId }
    });
    
    if (!hotelType) {
      throw new Error(`Hotel type with ID ${hotelTypeId} not found`);
    }

    // Validate that all feature IDs exist
    const features = await this.hotelFeatureRepository.find({
      where: { isActive: true }
    });
    
    const validFeatureIds = features.map(f => f.id);
    const invalidIds = featureIds.filter(id => !validFeatureIds.includes(id));
    
    if (invalidIds.length > 0) {
      throw new Error(`Invalid feature IDs: ${invalidIds.join(', ')}`);
    }

    hotelType.features = featureIds;
    return await this.hotelTypeRepository.save(hotelType);
  }

  // Hotel Types
  async createHotelType(createHotelTypeDto: CreateHotelTypeDto): Promise<HotelType> {
    const hotelType = this.hotelTypeRepository.create(createHotelTypeDto);
    return await this.hotelTypeRepository.save(hotelType);
  }

  async findAllHotelTypes(): Promise<HotelType[]> {
    return await this.hotelTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' }
    });
  }

  async findHotelTypeById(id: number): Promise<HotelType> {
    const hotelType = await this.hotelTypeRepository.findOne({
      where: { id, isActive: true }
    });
    
    if (!hotelType) {
      throw new Error(`Hotel type with ID ${id} not found`);
    }
    
    return hotelType;
  }

  async updateHotelType(id: number, updateHotelTypeDto: UpdateHotelTypeDto): Promise<HotelType> {
    const hotelType = await this.findHotelTypeById(id);
    Object.assign(hotelType, updateHotelTypeDto);
    return await this.hotelTypeRepository.save(hotelType);
  }

  async removeHotelType(id: number): Promise<void> {
    const hotelType = await this.findHotelTypeById(id);
    hotelType.isActive = false;
    await this.hotelTypeRepository.save(hotelType);
  }

  // Hotels
  async create(createHotelDto: CreateHotelDto): Promise<Hotel> {
    // Verify hotel type exists
    await this.findHotelTypeById(createHotelDto.hotelTypeId);

    const hotel = this.hotelRepository.create({
      ...createHotelDto,
      hotelType: { id: createHotelDto.hotelTypeId }
    });
    return await this.hotelRepository.save(hotel);
  }

  async update(id: number, updateHotelDto: Partial<CreateHotelDto>): Promise<Hotel> {
    const hotel = await this.findOne(id);

    // If hotelTypeId is being updated, verify it exists
    if (updateHotelDto.hotelTypeId && updateHotelDto.hotelTypeId !== hotel.hotelType.id) {
      await this.findHotelTypeById(updateHotelDto.hotelTypeId);
      updateHotelDto['hotelType'] = { id: updateHotelDto.hotelTypeId };
    }

    Object.assign(hotel, updateHotelDto);
    return await this.hotelRepository.save(hotel);
  }

  async delete(id: number): Promise<void> {
    const hotel = await this.findOne(id);
    hotel.isActive = false;
    await this.hotelRepository.save(hotel);
  }

  async findAll(): Promise<Hotel[]> {
    return await this.hotelRepository.find({
      where: { isActive: true },
      relations: ['hotelType'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: { id, isActive: true },
      relations: ['hotelType', 'roomTypes', 'images']
    });

    if (!hotel) {
      throw new Error(`Hotel with ID ${id} not found`);
    }

    return hotel;
  }

  async findByHotelType(hotelTypeId: number): Promise<Hotel[]> {
    return await this.hotelRepository.find({
      where: { 
        isActive: true,
        hotelType: { id: hotelTypeId }
      },
      relations: ['hotelType'],
      order: { starRating: 'DESC', createdAt: 'DESC' }
    });
  }

  async findHotelsByFeature(featureId: number): Promise<Hotel[]> {
    return await this.hotelRepository
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.hotelType', 'hotelType')
      .where('hotel.isActive = :isActive', { isActive: true })
      .andWhere('JSON_CONTAINS(hotel.features, :featureId)', { featureId: `"${featureId}"` })
      .orderBy('hotel.starRating', 'DESC')
      .addOrderBy('hotel.createdAt', 'DESC')
      .getMany();
  }

  // Room Type Management
  async createRoomType(hotelId: number, createRoomTypeDto: CreateRoomTypeDto) {
    const hotel = await this.hotelRepository.findOne({ where: { id: hotelId } });
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    const roomType = this.roomTypeRepository.create({
      ...createRoomTypeDto,
      hotel,
    });

    return this.roomTypeRepository.save(roomType);
  }

  async getRoomTypes(hotelId: number) {
    return this.roomTypeRepository.find({
      where: { hotel: { id: hotelId } },
      relations: ['prices', 'inventory', 'images'],
    });
  }

  async updateRoomType(roomTypeId: number, updateData: Partial<CreateRoomTypeDto>) {
    await this.roomTypeRepository.update(roomTypeId, updateData);
    return this.roomTypeRepository.findOne({
      where: { id: roomTypeId },
      relations: ['hotel', 'prices', 'inventory', 'images'],
    });
  }

  async deleteRoomType(roomTypeId: number): Promise<void> {
    await this.roomTypeRepository.delete(roomTypeId);
  }

  // Hotel Image Management
  async addHotelImage(hotelId: number, createImageDto: CreateHotelImageDto) {
    const hotel = await this.hotelRepository.findOne({ where: { id: hotelId } });
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    const image = this.hotelImageRepository.create({
      ...createImageDto,
      hotel,
    });

    return this.hotelImageRepository.save(image);
  }

  async getHotelImages(hotelId: number) {
    return this.hotelImageRepository.find({
      where: { hotel: { id: hotelId }, isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async updateHotelImage(imageId: number, updateImageDto: Partial<CreateHotelImageDto>) {
    await this.hotelImageRepository.update(imageId, updateImageDto);
    return this.hotelImageRepository.findOne({
      where: { id: imageId },
      relations: ['hotel'],
    });
  }

  async deleteHotelImage(imageId: number): Promise<void> {
    await this.hotelImageRepository.delete(imageId);
  }

  async setMainHotelImage(hotelId: number, imageId: number) {
    // Önce tüm ana fotoğrafları gallery yap
    await this.hotelImageRepository.update(
      { hotel: { id: hotelId }, imageType: 'main' },
      { imageType: 'gallery' }
    );

    // Seçilen fotoğrafı ana fotoğraf yap
    await this.hotelImageRepository.update(imageId, { imageType: 'main' });

    return this.hotelImageRepository.findOne({
      where: { id: imageId },
      relations: ['hotel'],
    });
  }

  // Search functionality
  async searchHotels(searchParams: {
    location?: string;
    checkIn?: Date;
    checkOut?: Date;
    guests?: number;
    starRating?: number[];
  }) {
    const queryBuilder = this.hotelRepository.createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.roomTypes', 'roomTypes')
      .leftJoinAndSelect('roomTypes.inventory', 'inventory')
      .leftJoinAndSelect('hotel.images', 'images');

    if (searchParams.location) {
      queryBuilder.where(
        '(hotel.city LIKE :location OR hotel.country LIKE :location)',
        { location: `%${searchParams.location}%` }
      );
    }

    if (searchParams.starRating && searchParams.starRating.length > 0) {
      queryBuilder.andWhere('hotel.starRating IN (:...starRating)', {
        starRating: searchParams.starRating,
      });
    }

    if (searchParams.guests) {
      queryBuilder.andWhere('roomTypes.maxOccupancy >= :guests', {
        guests: searchParams.guests,
      });
    }

    return queryBuilder.getMany();
  }
} 