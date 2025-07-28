import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { Hotel } from './entities/hotel.entity';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { CreateHotelImageDto } from './dto/create-hotel-image.dto';

@ApiTags('hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all hotels' })
  @ApiQuery({ name: 'city', required: false, description: 'Filter by city' })
  @ApiQuery({ name: 'stars', required: false, description: 'Filter by star rating' })
  @ApiResponse({ status: 200, description: 'Return all hotels', type: [Hotel] })
  async findAll(
    @Query('city') city?: string,
    @Query('stars') stars?: number,
  ): Promise<Hotel[]> {
    return this.hotelsService.findAll({ city, stars });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hotel by id' })
  @ApiResponse({ status: 200, description: 'Return hotel details', type: Hotel })
  async findOne(@Param('id') id: number): Promise<Hotel | null> {
    return this.hotelsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new hotel' })
  @ApiResponse({ status: 201, description: 'Hotel created successfully', type: Hotel })
  async create(@Body() createHotelDto: CreateHotelDto): Promise<Hotel> {
    return this.hotelsService.create(createHotelDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update hotel' })
  @ApiResponse({ status: 200, description: 'Hotel updated successfully', type: Hotel })
  async update(
    @Param('id') id: number,
    @Body() updateHotelDto: Partial<CreateHotelDto>,
  ): Promise<Hotel | null> {
    return this.hotelsService.update(id, updateHotelDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete hotel' })
  @ApiResponse({ status: 200, description: 'Hotel deleted successfully' })
  async delete(@Param('id') id: number): Promise<void> {
    return this.hotelsService.delete(id);
  }

  // Room Type Management
  @Post(':hotelId/room-types')
  @ApiOperation({ summary: 'Create new room type for hotel' })
  @ApiResponse({ status: 201, description: 'Room type created successfully' })
  async createRoomType(
    @Param('hotelId') hotelId: number,
    @Body() createRoomTypeDto: CreateRoomTypeDto,
  ) {
    return this.hotelsService.createRoomType(hotelId, createRoomTypeDto);
  }

  @Get(':hotelId/room-types')
  @ApiOperation({ summary: 'Get all room types for hotel' })
  @ApiResponse({ status: 200, description: 'Return hotel room types' })
  async getRoomTypes(@Param('hotelId') hotelId: number) {
    return this.hotelsService.getRoomTypes(hotelId);
  }

  // Hotel Image Management
  @Post(':hotelId/images')
  @ApiOperation({ summary: 'Add image to hotel' })
  @ApiResponse({ status: 201, description: 'Image added successfully' })
  async addHotelImage(
    @Param('hotelId') hotelId: number,
    @Body() createImageDto: CreateHotelImageDto,
  ) {
    return this.hotelsService.addHotelImage(hotelId, createImageDto);
  }

  @Get(':hotelId/images')
  @ApiOperation({ summary: 'Get all hotel images' })
  @ApiResponse({ status: 200, description: 'Return hotel images' })
  async getHotelImages(@Param('hotelId') hotelId: number) {
    return this.hotelsService.getHotelImages(hotelId);
  }

  @Put(':hotelId/images/:imageId')
  @ApiOperation({ summary: 'Update hotel image' })
  @ApiResponse({ status: 200, description: 'Image updated successfully' })
  async updateHotelImage(
    @Param('hotelId') hotelId: number,
    @Param('imageId') imageId: number,
    @Body() updateImageDto: Partial<CreateHotelImageDto>,
  ) {
    return this.hotelsService.updateHotelImage(imageId, updateImageDto);
  }

  @Delete(':hotelId/images/:imageId')
  @ApiOperation({ summary: 'Delete hotel image' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  async deleteHotelImage(
    @Param('hotelId') hotelId: number,
    @Param('imageId') imageId: number,
  ) {
    return this.hotelsService.deleteHotelImage(imageId);
  }

  @Put(':hotelId/images/:imageId/set-main')
  @ApiOperation({ summary: 'Set image as main hotel image' })
  @ApiResponse({ status: 200, description: 'Main image set successfully' })
  async setMainImage(
    @Param('hotelId') hotelId: number,
    @Param('imageId') imageId: number,
  ) {
    return this.hotelsService.setMainHotelImage(hotelId, imageId);
  }
} 