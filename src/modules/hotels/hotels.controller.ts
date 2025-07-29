import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { CreateHotelImageDto } from './dto/create-hotel-image.dto';
import { CreateHotelTypeDto } from './dto/create-hotel-type.dto';
import { UpdateHotelTypeDto } from './dto/update-hotel-type.dto';
import { CreateHotelFeatureDto } from './dto/create-hotel-feature.dto';
import { UpdateHotelFeatureDto } from './dto/update-hotel-feature.dto';
import { Hotel } from './entities/hotel.entity';
import { RoomType } from './entities/room-type.entity';
import { HotelImage } from './entities/hotel-image.entity';
import { HotelType } from './entities/hotel-type.entity';
import { HotelFeature } from './entities/hotel-feature.entity';
import { RequirePermission, RequireAnyPermission, HotelManagement } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  // ==================== HOTEL CRUD ====================

  @RequirePermission('hotels.create')
  @Post()
  @ApiOperation({ summary: 'Create hotel' })
  @ApiResponse({ status: 201, description: 'Hotel created successfully.', type: Hotel })
  create(@Body() createHotelDto: CreateHotelDto): Promise<Hotel> {
    return this.hotelsService.create(createHotelDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all hotels' })
  @ApiResponse({ status: 200, description: 'List of hotels', type: [Hotel] })
  @ApiQuery({ name: 'feature', required: false, description: 'Filter by feature ID' })
  findAll(@Query('feature') feature?: number): Promise<Hotel[]> {
    if (feature) {
      return this.hotelsService.findHotelsByFeature(feature);
    }
    return this.hotelsService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get hotel by id' })
  @ApiResponse({ status: 200, description: 'Hotel found', type: Hotel })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Hotel> {
    return this.hotelsService.findOne(id);
  }

  @RequirePermission('hotels.update')
  @Patch(':id')
  @ApiOperation({ summary: 'Update hotel' })
  @ApiResponse({ status: 200, description: 'Hotel updated successfully.', type: Hotel })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateHotelDto: UpdateHotelDto): Promise<Hotel> {
    return this.hotelsService.update(id, updateHotelDto);
  }

  @RequirePermission('hotels.delete')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete hotel' })
  @ApiResponse({ status: 200, description: 'Hotel deleted successfully.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.hotelsService.remove(id);
  }

  // ==================== ROOM TYPES ====================

  @HotelManagement()
  @Post('room-types')
  @ApiOperation({ summary: 'Create room type' })
  @ApiResponse({ status: 201, description: 'Room type created successfully.', type: RoomType })
  createRoomType(@Body() createRoomTypeDto: CreateRoomTypeDto): Promise<RoomType> {
    return this.hotelsService.createRoomType(createRoomTypeDto);
  }

  @Public()
  @Get('room-types')
  @ApiOperation({ summary: 'Get all room types' })
  @ApiResponse({ status: 200, description: 'List of room types', type: [RoomType] })
  findAllRoomTypes(): Promise<RoomType[]> {
    return this.hotelsService.findAllRoomTypes();
  }

  @RequirePermission('hotels.manage_rooms')
  @Patch('room-types/:id')
  @ApiOperation({ summary: 'Update room type' })
  @ApiResponse({ status: 200, description: 'Room type updated successfully.', type: RoomType })
  updateRoomType(@Param('id', ParseIntPipe) id: number, @Body() updateRoomTypeDto: UpdateRoomTypeDto): Promise<RoomType> {
    return this.hotelsService.updateRoomType(id, updateRoomTypeDto);
  }

  // ==================== HOTEL IMAGES ====================

  @RequirePermission('hotels.update')
  @Post(':hotelId/images')
  @ApiOperation({ summary: 'Add hotel image' })
  @ApiResponse({ status: 201, description: 'Hotel image added successfully.', type: HotelImage })
  addHotelImage(@Param('hotelId', ParseIntPipe) hotelId: number, @Body() createHotelImageDto: CreateHotelImageDto): Promise<HotelImage> {
    return this.hotelsService.addHotelImage(hotelId, createHotelImageDto);
  }

  // ==================== HOTEL TYPES ====================

  @RequireAnyPermission('hotels.create', 'hotels.update', 'system.admin')
  @Post('types')
  @ApiOperation({ summary: 'Create hotel type' })
  @ApiResponse({ status: 201, description: 'Hotel type created successfully.', type: HotelType })
  createHotelType(@Body() createHotelTypeDto: CreateHotelTypeDto): Promise<HotelType> {
    return this.hotelsService.createHotelType(createHotelTypeDto);
  }

  @Public()
  @Get('types')
  @ApiOperation({ summary: 'Get all hotel types' })
  @ApiResponse({ status: 200, description: 'List of hotel types', type: [HotelType] })
  findAllHotelTypes(): Promise<HotelType[]> {
    return this.hotelsService.findAllHotelTypes();
  }

  @Public()
  @Get('types/:id')
  @ApiOperation({ summary: 'Get hotel type by id' })
  @ApiResponse({ status: 200, description: 'Hotel type found', type: HotelType })
  findHotelTypeById(@Param('id', ParseIntPipe) id: number): Promise<HotelType> {
    return this.hotelsService.findHotelTypeById(id);
  }

  @RequirePermission('hotels.update')
  @Put('types/:id')
  @ApiOperation({ summary: 'Update hotel type' })
  @ApiResponse({ status: 200, description: 'Hotel type updated successfully.', type: HotelType })
  updateHotelType(@Param('id', ParseIntPipe) id: number, @Body() updateHotelTypeDto: UpdateHotelTypeDto): Promise<HotelType> {
    return this.hotelsService.updateHotelType(id, updateHotelTypeDto);
  }

  @RequirePermission('hotels.delete')
  @Delete('types/:id')
  @ApiOperation({ summary: 'Delete hotel type' })
  @ApiResponse({ status: 200, description: 'Hotel type deleted successfully.' })
  deleteHotelType(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.hotelsService.deleteHotelType(id);
  }

  // ==================== HOTEL FEATURES ====================

  @RequireAnyPermission('hotels.create', 'hotels.update', 'system.admin')
  @Post('features')
  @ApiOperation({ summary: 'Create hotel feature' })
  @ApiResponse({ status: 201, description: 'Hotel feature created successfully.', type: HotelFeature })
  createHotelFeature(@Body() createHotelFeatureDto: CreateHotelFeatureDto): Promise<HotelFeature> {
    return this.hotelsService.createHotelFeature(createHotelFeatureDto);
  }

  @Public()
  @Get('features')
  @ApiOperation({ summary: 'Get all hotel features' })
  @ApiResponse({ status: 200, description: 'List of hotel features', type: [HotelFeature] })
  findAllHotelFeatures(): Promise<HotelFeature[]> {
    return this.hotelsService.findAllHotelFeatures();
  }

  @Public()
  @Get('features/:id')
  @ApiOperation({ summary: 'Get hotel feature by id' })
  @ApiResponse({ status: 200, description: 'Hotel feature found', type: HotelFeature })
  findHotelFeatureById(@Param('id', ParseIntPipe) id: number): Promise<HotelFeature> {
    return this.hotelsService.findHotelFeatureById(id);
  }

  @RequirePermission('hotels.update')
  @Put('features/:id')
  @ApiOperation({ summary: 'Update hotel feature' })
  @ApiResponse({ status: 200, description: 'Hotel feature updated successfully.', type: HotelFeature })
  updateHotelFeature(@Param('id', ParseIntPipe) id: number, @Body() updateHotelFeatureDto: UpdateHotelFeatureDto): Promise<HotelFeature> {
    return this.hotelsService.updateHotelFeature(id, updateHotelFeatureDto);
  }

  @RequirePermission('hotels.delete')
  @Delete('features/:id')
  @ApiOperation({ summary: 'Delete hotel feature' })
  @ApiResponse({ status: 200, description: 'Hotel feature deleted successfully.' })
  deleteHotelFeature(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.hotelsService.deleteHotelFeature(id);
  }

  // ==================== FEATURE ASSIGNMENTS ====================

  @RequirePermission('hotels.update')
  @Post(':hotelId/features')
  @ApiOperation({ summary: 'Assign features to hotel' })
  @ApiResponse({ status: 200, description: 'Features assigned to hotel successfully.', type: Hotel })
  assignFeaturesToHotel(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @Body() body: { featureIds: number[] },
  ): Promise<Hotel> {
    return this.hotelsService.assignFeaturesToHotel(hotelId, body.featureIds);
  }

  @RequirePermission('hotels.update')
  @Post('types/:hotelTypeId/features')
  @ApiOperation({ summary: 'Assign features to hotel type' })
  @ApiResponse({ status: 200, description: 'Features assigned to hotel type successfully.', type: HotelType })
  assignFeaturesToHotelType(
    @Param('hotelTypeId', ParseIntPipe) hotelTypeId: number,
    @Body() body: { featureIds: number[] },
  ): Promise<HotelType> {
    return this.hotelsService.assignFeaturesToHotelType(hotelTypeId, body.featureIds);
  }
} 