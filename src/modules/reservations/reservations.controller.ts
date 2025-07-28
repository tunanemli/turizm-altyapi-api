import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  Query, 
  UseGuards,
  Request 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto, CancelReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../users/constants/permissions';

@ApiTags('reservations')
@Controller('reservations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.RESERVATION_CREATE)
  @ApiOperation({ summary: 'Create new reservation' })
  @ApiResponse({ status: 201, description: 'Reservation created successfully', type: Reservation })
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @Request() req,
  ): Promise<Reservation> {
    return this.reservationsService.createReservation(
      createReservationDto,
      req.user.userId,
    );
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.RESERVATION_VIEW)
  @ApiOperation({ summary: 'Get all reservations' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'customerId', required: false, description: 'Filter by customer ID' })
  @ApiQuery({ name: 'hotelId', required: false, description: 'Filter by hotel ID' })
  @ApiQuery({ name: 'checkInFrom', required: false, description: 'Filter by check-in date from' })
  @ApiQuery({ name: 'checkInTo', required: false, description: 'Filter by check-in date to' })
  @ApiResponse({ status: 200, description: 'Return all reservations', type: [Reservation] })
  async findAll(
    @Query('status') status?: string,
    @Query('customerId') customerId?: number,
    @Query('hotelId') hotelId?: number,
    @Query('checkInFrom') checkInFrom?: string,
    @Query('checkInTo') checkInTo?: string,
    @Request() req?,
  ): Promise<Reservation[]> {
    const filters: any = { status, customerId, hotelId };
    
    if (checkInFrom) filters.checkInFrom = new Date(checkInFrom);
    if (checkInTo) filters.checkInTo = new Date(checkInTo);

    // If user is a customer, only show their reservations
    if (req.user.role === 'customer') {
      filters.customerId = req.user.userId;
    }

    return this.reservationsService.findAll(filters);
  }

  @Get('my-reservations')
  @ApiOperation({ summary: 'Get current user reservations' })
  @ApiResponse({ status: 200, description: 'Return user reservations', type: [Reservation] })
  async getMyReservations(@Request() req): Promise<Reservation[]> {
    return this.reservationsService.findAll({ customerId: req.user.userId });
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.RESERVATION_VIEW)
  @ApiOperation({ summary: 'Get reservation by id' })
  @ApiResponse({ status: 200, description: 'Return reservation details', type: Reservation })
  async findOne(@Param('id') id: number): Promise<Reservation | null> {
    return this.reservationsService.findOne(id);
  }

  @Get('by-number/:reservationNumber')
  @ApiOperation({ summary: 'Get reservation by reservation number' })
  @ApiResponse({ status: 200, description: 'Return reservation details', type: Reservation })
  async findByNumber(@Param('reservationNumber') reservationNumber: string): Promise<Reservation | null> {
    return this.reservationsService.findByReservationNumber(reservationNumber);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.RESERVATION_UPDATE)
  @ApiOperation({ summary: 'Update reservation' })
  @ApiResponse({ status: 200, description: 'Reservation updated successfully', type: Reservation })
  async update(
    @Param('id') id: number,
    @Body() updateReservationDto: UpdateReservationDto,
  ): Promise<Reservation | null> {
    return this.reservationsService.updateReservation(id, updateReservationDto);
  }

  @Put(':id/confirm')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.RESERVATION_CONFIRM)
  @ApiOperation({ summary: 'Confirm reservation' })
  @ApiResponse({ status: 200, description: 'Reservation confirmed successfully', type: Reservation })
  async confirm(@Param('id') id: number): Promise<Reservation | null> {
    return this.reservationsService.confirmReservation(id);
  }

  @Put(':id/cancel')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.RESERVATION_CANCEL)
  @ApiOperation({ summary: 'Cancel reservation' })
  @ApiResponse({ status: 200, description: 'Reservation cancelled successfully', type: Reservation })
  async cancel(
    @Param('id') id: number,
    @Body() cancelReservationDto: CancelReservationDto,
  ): Promise<Reservation | null> {
    return this.reservationsService.cancelReservation(id, cancelReservationDto);
  }

  @Get('hotel/:hotelId/availability')
  @ApiOperation({ summary: 'Check room availability for hotel' })
  @ApiQuery({ name: 'checkIn', required: true, description: 'Check-in date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'checkOut', required: true, description: 'Check-out date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'roomTypeId', required: false, description: 'Specific room type ID' })
  @ApiResponse({ status: 200, description: 'Return availability status' })
  async checkAvailability(
    @Param('hotelId') hotelId: number,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
    @Query('roomTypeId') roomTypeId?: number,
  ) {
    // TODO: Implement availability check
    return { available: true, message: 'Availability check not yet implemented' };
  }
} 