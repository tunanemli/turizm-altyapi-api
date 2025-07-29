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
import { CreateHotelDto } from './dto/create-hotel.dto';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { CreateHotelImageDto } from './dto/create-hotel-image.dto';

@Injectable()
export class HotelsService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    @InjectRepository(RoomType)
    private readonly roomTypeRepository: Repository<RoomType>,
    @InjectRepository(RoomPrice)
    private readonly roomPriceRepository: Repository<RoomPrice>,
    @InjectRepository(RoomInventory)
    private readonly roomInventoryRepository: Repository<RoomInventory>,
    @InjectRepository(HotelImage)
    private readonly hotelImageRepository: Repository<HotelImage>,
    @InjectRepository(RoomImage)
    private readonly roomImageRepository: Repository<RoomImage>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async findAll(filters?: { city?: string; stars?: number }): Promise<Hotel[]> {
    const queryBuilder = this.hotelRepository.createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.roomTypes', 'roomTypes')
      .leftJoinAndSelect('hotel.images', 'images');

    if (filters?.city) {
      queryBuilder.where('hotel.city = :city', { city: filters.city });
    }

    if (filters?.stars) {
      queryBuilder.andWhere('hotel.starRating = :stars', { stars: filters.stars });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Hotel | null> {
    return this.hotelRepository.findOne({
      where: { id },
      relations: ['roomTypes', 'roomTypes.prices', 'roomTypes.inventory', 'images', 'roomTypes.images'],
    });
  }

  async create(createHotelDto: CreateHotelDto): Promise<Hotel> {
    const hotel = this.hotelRepository.create(createHotelDto);
    return this.hotelRepository.save(hotel);
  }

  async update(id: number, updateHotelDto: Partial<CreateHotelDto>): Promise<Hotel | null> {
    await this.hotelRepository.update(id, updateHotelDto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.hotelRepository.delete(id);
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