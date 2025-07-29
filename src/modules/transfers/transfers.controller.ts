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
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { TransfersService } from './transfers.service';
import { TransferType } from './entities/transfer-type.entity';
import { TransferVehicle } from './entities/transfer-vehicle.entity';
import { TransferRoute } from './entities/transfer-route.entity';
import { Transfer } from './entities/transfer.entity';
import { TransferSchedule } from './entities/transfer-schedule.entity';
import { TransferBooking, BookingStatus } from './entities/transfer-booking.entity';
import { CreateTransferTypeDto } from './dto/create-transfer-type.dto';
import { CreateTransferVehicleDto } from './dto/create-transfer-vehicle.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateTransferBookingDto } from './dto/create-transfer-booking.dto';
import { UpdateTransferDto, UpdateTransferTypeDto, UpdateTransferVehicleDto } from './dto/update-transfer.dto';
import { RequirePermission, RequireAnyPermission, TransferManagement } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Transfers')
@Controller('transfers')
@ApiBearerAuth()
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  // ==================== TRANSFER TYPES ====================

  @RequireAnyPermission('transfers.create', 'system.admin')
  @Post('types')
  @ApiOperation({ summary: 'Create transfer type' })
  @ApiResponse({ status: 201, description: 'Transfer type created successfully', type: TransferType })
  async createTransferType(@Body() createTransferTypeDto: CreateTransferTypeDto): Promise<TransferType> {
    return this.transfersService.createTransferType(createTransferTypeDto);
  }

  @Public()
  @Get('types')
  @ApiOperation({ summary: 'Get all transfer types' })
  @ApiResponse({ status: 200, description: 'List of transfer types', type: [TransferType] })
  async findAllTransferTypes(): Promise<TransferType[]> {
    return this.transfersService.findAllTransferTypes();
  }

  @Public()
  @Get('types/:id')
  @ApiOperation({ summary: 'Get transfer type by ID' })
  @ApiResponse({ status: 200, description: 'Transfer type found', type: TransferType })
  @ApiResponse({ status: 404, description: 'Transfer type not found' })
  async findTransferTypeById(@Param('id', ParseIntPipe) id: number): Promise<TransferType> {
    return this.transfersService.findTransferTypeById(id);
  }

  @RequirePermission('transfers.update')
  @Patch('types/:id')
  @ApiOperation({ summary: 'Update transfer type' })
  @ApiResponse({ status: 200, description: 'Transfer type updated successfully', type: TransferType })
  async updateTransferType(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransferTypeDto: UpdateTransferTypeDto,
  ): Promise<TransferType> {
    return this.transfersService.updateTransferType(id, updateTransferTypeDto);
  }

  @RequirePermission('transfers.delete')
  @Delete('types/:id')
  @ApiOperation({ summary: 'Delete transfer type' })
  @ApiResponse({ status: 200, description: 'Transfer type deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async deleteTransferType(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.transfersService.deleteTransferType(id);
    return { message: 'Transfer type deleted successfully' };
  }

  // ==================== TRANSFER VEHICLES ====================

  @RequirePermission('transfers.manage_vehicles')
  @Post('vehicles')
  @ApiOperation({ summary: 'Create transfer vehicle' })
  @ApiResponse({ status: 201, description: 'Transfer vehicle created successfully', type: TransferVehicle })
  async createTransferVehicle(@Body() createTransferVehicleDto: CreateTransferVehicleDto): Promise<TransferVehicle> {
    return this.transfersService.createTransferVehicle(createTransferVehicleDto);
  }

  @RequireAnyPermission('transfers.read', 'transfers.manage_vehicles')
  @Get('vehicles')
  @ApiOperation({ summary: 'Get all transfer vehicles' })
  @ApiResponse({ status: 200, description: 'List of transfer vehicles', type: [TransferVehicle] })
  async findAllTransferVehicles(): Promise<TransferVehicle[]> {
    return this.transfersService.findAllTransferVehicles();
  }

  @RequireAnyPermission('transfers.read', 'transfers.manage_vehicles')
  @Get('vehicles/:id')
  @ApiOperation({ summary: 'Get transfer vehicle by ID' })
  @ApiResponse({ status: 200, description: 'Transfer vehicle found', type: TransferVehicle })
  @ApiResponse({ status: 404, description: 'Transfer vehicle not found' })
  async findTransferVehicleById(@Param('id', ParseIntPipe) id: number): Promise<TransferVehicle> {
    return this.transfersService.findTransferVehicleById(id);
  }

  @RequirePermission('transfers.manage_vehicles')
  @Patch('vehicles/:id')
  @ApiOperation({ summary: 'Update transfer vehicle' })
  @ApiResponse({ status: 200, description: 'Transfer vehicle updated successfully', type: TransferVehicle })
  async updateTransferVehicle(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransferVehicleDto: UpdateTransferVehicleDto,
  ): Promise<TransferVehicle> {
    return this.transfersService.updateTransferVehicle(id, updateTransferVehicleDto);
  }

  @RequirePermission('transfers.manage_vehicles')
  @Delete('vehicles/:id')
  @ApiOperation({ summary: 'Delete transfer vehicle' })
  @ApiResponse({ status: 200, description: 'Transfer vehicle deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async deleteTransferVehicle(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.transfersService.deleteTransferVehicle(id);
    return { message: 'Transfer vehicle deleted successfully' };
  }

  // ==================== TRANSFER ROUTES ====================

  @Public()
  @Get('routes')
  @ApiOperation({ summary: 'Get all transfer routes' })
  @ApiResponse({ status: 200, description: 'List of transfer routes', type: [TransferRoute] })
  async findAllTransferRoutes(): Promise<TransferRoute[]> {
    return this.transfersService.findAllTransferRoutes();
  }

  @Public()
  @Get('routes/:id')
  @ApiOperation({ summary: 'Get transfer route by ID' })
  @ApiResponse({ status: 200, description: 'Transfer route found', type: TransferRoute })
  @ApiResponse({ status: 404, description: 'Transfer route not found' })
  async findTransferRouteById(@Param('id', ParseIntPipe) id: number): Promise<TransferRoute> {
    return this.transfersService.findTransferRouteById(id);
  }

  // ==================== TRANSFERS ====================

  @RequirePermission('transfers.create')
  @Post()
  @ApiOperation({ summary: 'Create transfer' })
  @ApiResponse({ status: 201, description: 'Transfer created successfully', type: Transfer })
  async createTransfer(@Body() createTransferDto: CreateTransferDto): Promise<Transfer> {
    return this.transfersService.createTransfer(createTransferDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all transfers' })
  @ApiResponse({ status: 200, description: 'List of transfers', type: [Transfer] })
  async findAllTransfers(): Promise<Transfer[]> {
    return this.transfersService.findAllTransfers();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get transfer by ID' })
  @ApiResponse({ status: 200, description: 'Transfer found', type: Transfer })
  @ApiResponse({ status: 404, description: 'Transfer not found' })
  async findTransferById(@Param('id', ParseIntPipe) id: number): Promise<Transfer> {
    return this.transfersService.findTransferById(id);
  }

  @RequirePermission('transfers.update')
  @Patch(':id')
  @ApiOperation({ summary: 'Update transfer' })
  @ApiResponse({ status: 200, description: 'Transfer updated successfully', type: Transfer })
  async updateTransfer(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransferDto: UpdateTransferDto,
  ): Promise<Transfer> {
    return this.transfersService.updateTransfer(id, updateTransferDto);
  }

  @RequirePermission('transfers.delete')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete transfer' })
  @ApiResponse({ status: 200, description: 'Transfer deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async deleteTransfer(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.transfersService.deleteTransfer(id);
    return { message: 'Transfer deleted successfully' };
  }

  // ==================== TRANSFER SCHEDULES ====================

  @RequirePermission('transfers.manage_schedules')
  @Post(':transferId/schedules')
  @ApiOperation({ summary: 'Create transfer schedule' })
  @ApiResponse({ status: 201, description: 'Transfer schedule created successfully', type: TransferSchedule })
  async createTransferSchedule(
    @Param('transferId', ParseIntPipe) transferId: number,
    @Body() scheduleData: {
      vehicleId: number;
      scheduleDate: string;
      departureTime: string;
      arrivalTime?: string;
      availableSeats: number;
      specialPrice?: number;
      notes?: string;
    },
  ): Promise<TransferSchedule> {
    return this.transfersService.createTransferSchedule({
      transferId,
      ...scheduleData,
      scheduleDate: new Date(scheduleData.scheduleDate),
    });
  }

  @RequireAnyPermission('transfers.read', 'transfers.manage_schedules')
  @Get('schedules')
  @ApiOperation({ summary: 'Get transfer schedules' })
  @ApiResponse({ status: 200, description: 'List of transfer schedules', type: [TransferSchedule] })
  @ApiQuery({ name: 'transferId', required: false, description: 'Filter by transfer ID' })
  @ApiQuery({ name: 'vehicleId', required: false, description: 'Filter by vehicle ID' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Filter from date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Filter to date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'availableSeatsOnly', required: false, description: 'Show only schedules with available seats' })
  async findTransferSchedules(
    @Query('transferId') transferId?: number,
    @Query('vehicleId') vehicleId?: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('availableSeatsOnly') availableSeatsOnly?: boolean,
  ): Promise<TransferSchedule[]> {
    return this.transfersService.findTransferSchedules({
      transferId,
      vehicleId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      availableSeatsOnly,
    });
  }

  // ==================== TRANSFER BOOKINGS ====================

  @RequireAnyPermission('transfers.create', 'reservations.create')
  @Post('bookings')
  @ApiOperation({ summary: 'Create transfer booking' })
  @ApiResponse({ status: 201, description: 'Transfer booking created successfully', type: TransferBooking })
  async createTransferBooking(@Body() createTransferBookingDto: CreateTransferBookingDto): Promise<TransferBooking> {
    return this.transfersService.createTransferBooking(createTransferBookingDto);
  }

  @RequireAnyPermission('transfers.read', 'reservations.read')
  @Get('bookings')
  @ApiOperation({ summary: 'Get transfer bookings' })
  @ApiResponse({ status: 200, description: 'List of transfer bookings', type: [TransferBooking] })
  @ApiQuery({ name: 'customerId', required: false, description: 'Filter by customer ID' })
  @ApiQuery({ name: 'agentId', required: false, description: 'Filter by agent ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by booking status' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Filter from date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Filter to date (YYYY-MM-DD)' })
  async findTransferBookings(
    @Query('customerId') customerId?: number,
    @Query('agentId') agentId?: number,
    @Query('status') status?: BookingStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<TransferBooking[]> {
    return this.transfersService.findTransferBookings({
      customerId,
      agentId,
      status,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });
  }

  @RequireAnyPermission('transfers.read', 'reservations.read')
  @Get('bookings/:id')
  @ApiOperation({ summary: 'Get transfer booking by ID' })
  @ApiResponse({ status: 200, description: 'Transfer booking found', type: TransferBooking })
  @ApiResponse({ status: 404, description: 'Transfer booking not found' })
  async findTransferBookingById(@Param('id', ParseIntPipe) id: number): Promise<TransferBooking> {
    return this.transfersService.findTransferBookingById(id);
  }

  @RequireAnyPermission('transfers.update', 'reservations.cancel')
  @Post('bookings/:id/cancel')
  @ApiOperation({ summary: 'Cancel transfer booking' })
  @ApiResponse({ status: 200, description: 'Transfer booking cancelled successfully', type: TransferBooking })
  async cancelTransferBooking(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason: string },
  ): Promise<TransferBooking> {
    return this.transfersService.cancelTransferBooking(id, body.reason);
  }

  // ==================== STATISTICS ====================

  @RequireAnyPermission('reports.view_analytics', 'transfers.read')
  @Get('statistics/dashboard')
  @ApiOperation({ summary: 'Get transfer statistics' })
  @ApiResponse({ status: 200, description: 'Transfer statistics' })
  async getTransferStatistics(): Promise<{
    totalTransfers: number;
    activeTransfers: number;
    totalBookings: number;
    todayBookings: number;
    totalRevenue: number;
    vehicleUtilization: number;
  }> {
    return this.transfersService.getTransferStatistics();
  }
}