import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { CreateHotelImageDto } from './dto/create-hotel-image.dto';
import { CreateHotelTypeDto } from './dto/create-hotel-type.dto';
import { UpdateHotelTypeDto } from './dto/update-hotel-type.dto';

@ApiTags('hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  // Hotel Types Endpoints
  @Post('types')
  @ApiOperation({ summary: 'Create a new hotel type' })
  @ApiResponse({ status: 201, description: 'Hotel type created successfully' })
  createHotelType(@Body() createHotelTypeDto: CreateHotelTypeDto) {
    return this.hotelsService.createHotelType(createHotelTypeDto);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all hotel types' })
  @ApiResponse({ status: 200, description: 'List of hotel types' })
  findAllHotelTypes() {
    return this.hotelsService.findAllHotelTypes();
  }

  @Get('types/:id')
  @ApiOperation({ summary: 'Get a hotel type by ID' })
  @ApiResponse({ status: 200, description: 'Hotel type found' })
  @ApiResponse({ status: 404, description: 'Hotel type not found' })
  findHotelTypeById(@Param('id', ParseIntPipe) id: number) {
    return this.hotelsService.findHotelTypeById(id);
  }

  @Patch('types/:id')
  @ApiOperation({ summary: 'Update a hotel type' })
  @ApiResponse({ status: 200, description: 'Hotel type updated successfully' })
  @ApiResponse({ status: 404, description: 'Hotel type not found' })
  updateHotelType(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHotelTypeDto: UpdateHotelTypeDto
  ) {
    return this.hotelsService.updateHotelType(id, updateHotelTypeDto);
  }

  @Delete('types/:id')
  @ApiOperation({ summary: 'Delete a hotel type' })
  @ApiResponse({ status: 200, description: 'Hotel type deleted successfully' })
  @ApiResponse({ status: 404, description: 'Hotel type not found' })
  removeHotelType(@Param('id', ParseIntPipe) id: number) {
    return this.hotelsService.removeHotelType(id);
  }

  // Hotels Endpoints - Updated
  @Post()
  @ApiOperation({ summary: 'Create a new hotel' })
  @ApiResponse({ status: 201, description: 'Hotel created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createHotelDto: CreateHotelDto) {
    return this.hotelsService.create(createHotelDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all hotels with optional filtering' })
  @ApiResponse({ status: 200, description: 'List of hotels' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by hotel type ID' })
  @ApiQuery({ name: 'city', required: false, description: 'Filter by city' })
  @ApiQuery({ name: 'stars', required: false, description: 'Filter by star rating' })
  findAll(
    @Query('type') type?: string,
    @Query('city') city?: string,
    @Query('stars') stars?: string
  ) {
    if (type) {
      return this.hotelsService.findByHotelType(parseInt(type));
    }
    
    return this.hotelsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a hotel by ID' })
  @ApiResponse({ status: 200, description: 'Hotel found' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hotelsService.findOne(id);
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