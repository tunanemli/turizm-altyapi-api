import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { TransferType } from './entities/transfer-type.entity';
import { TransferVehicle } from './entities/transfer-vehicle.entity';
import { TransferRoute } from './entities/transfer-route.entity';
import { Transfer } from './entities/transfer.entity';
import { TransferPrice } from './entities/transfer-price.entity';
import { TransferSchedule } from './entities/transfer-schedule.entity';
import { TransferBooking, BookingStatus } from './entities/transfer-booking.entity';
import { CreateTransferTypeDto } from './dto/create-transfer-type.dto';
import { CreateTransferVehicleDto } from './dto/create-transfer-vehicle.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateTransferBookingDto } from './dto/create-transfer-booking.dto';
import { UpdateTransferDto, UpdateTransferTypeDto, UpdateTransferVehicleDto } from './dto/update-transfer.dto';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(TransferType)
    private transferTypeRepository: Repository<TransferType>,
    @InjectRepository(TransferVehicle)
    private transferVehicleRepository: Repository<TransferVehicle>,
    @InjectRepository(TransferRoute)
    private transferRouteRepository: Repository<TransferRoute>,
    @InjectRepository(Transfer)
    private transferRepository: Repository<Transfer>,
    @InjectRepository(TransferPrice)
    private transferPriceRepository: Repository<TransferPrice>,
    @InjectRepository(TransferSchedule)
    private transferScheduleRepository: Repository<TransferSchedule>,
    @InjectRepository(TransferBooking)
    private transferBookingRepository: Repository<TransferBooking>,
  ) {}

  // ==================== TRANSFER TYPES ====================

  async createTransferType(createTransferTypeDto: CreateTransferTypeDto): Promise<TransferType> {
    const transferType = this.transferTypeRepository.create(createTransferTypeDto);
    return this.transferTypeRepository.save(transferType);
  }

  async findAllTransferTypes(): Promise<TransferType[]> {
    return this.transferTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' }
    });
  }

  async findTransferTypeById(id: number): Promise<TransferType> {
    const transferType = await this.transferTypeRepository.findOne({
      where: { id, isActive: true },
      relations: ['transfers']
    });

    if (!transferType) {
      throw new NotFoundException('Transfer type not found');
    }

    return transferType;
  }

  async updateTransferType(id: number, updateTransferTypeDto: UpdateTransferTypeDto): Promise<TransferType> {
    const transferType = await this.findTransferTypeById(id);
    Object.assign(transferType, updateTransferTypeDto);
    return this.transferTypeRepository.save(transferType);
  }

  async deleteTransferType(id: number): Promise<void> {
    const transferType = await this.findTransferTypeById(id);
    transferType.isActive = false;
    await this.transferTypeRepository.save(transferType);
  }

  // ==================== TRANSFER VEHICLES ====================

  async createTransferVehicle(createTransferVehicleDto: CreateTransferVehicleDto): Promise<TransferVehicle> {
    const vehicle = this.transferVehicleRepository.create(createTransferVehicleDto);
    return this.transferVehicleRepository.save(vehicle);
  }

  async findAllTransferVehicles(): Promise<TransferVehicle[]> {
    return this.transferVehicleRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' }
    });
  }

  async findTransferVehicleById(id: number): Promise<TransferVehicle> {
    const vehicle = await this.transferVehicleRepository.findOne({
      where: { id, isActive: true },
      relations: ['schedules']
    });

    if (!vehicle) {
      throw new NotFoundException('Transfer vehicle not found');
    }

    return vehicle;
  }

  async updateTransferVehicle(id: number, updateTransferVehicleDto: UpdateTransferVehicleDto): Promise<TransferVehicle> {
    const vehicle = await this.findTransferVehicleById(id);
    Object.assign(vehicle, updateTransferVehicleDto);
    return this.transferVehicleRepository.save(vehicle);
  }

  async deleteTransferVehicle(id: number): Promise<void> {
    const vehicle = await this.findTransferVehicleById(id);
    vehicle.isActive = false;
    await this.transferVehicleRepository.save(vehicle);
  }

  // ==================== TRANSFER ROUTES ====================

  async findAllTransferRoutes(): Promise<TransferRoute[]> {
    return this.transferRouteRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' }
    });
  }

  async findTransferRouteById(id: number): Promise<TransferRoute> {
    const route = await this.transferRouteRepository.findOne({
      where: { id, isActive: true },
      relations: ['transfers']
    });

    if (!route) {
      throw new NotFoundException('Transfer route not found');
    }

    return route;
  }

  // ==================== TRANSFERS ====================

  async createTransfer(createTransferDto: CreateTransferDto): Promise<Transfer> {
    // Validate transfer type exists
    const transferType = await this.transferTypeRepository.findOne({
      where: { id: createTransferDto.transferTypeId, isActive: true }
    });

    if (!transferType) {
      throw new BadRequestException('Transfer type not found');
    }

    const transfer = this.transferRepository.create(createTransferDto);
    return this.transferRepository.save(transfer);
  }

  async findAllTransfers(): Promise<Transfer[]> {
    return this.transferRepository.find({
      where: { isActive: true },
      relations: [
        'transferType',
        'route',
        'fromHotel',
        'toHotel',
        'tour',
        'prices',
        'schedules'
      ],
      order: { name: 'ASC' }
    });
  }

  async findTransferById(id: number): Promise<Transfer> {
    const transfer = await this.transferRepository.findOne({
      where: { id, isActive: true },
      relations: [
        'transferType',
        'route',
        'fromHotel',
        'toHotel',
        'tour',
        'prices',
        'schedules',
        'schedules.vehicle',
        'schedules.bookings'
      ]
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    return transfer;
  }

  async updateTransfer(id: number, updateTransferDto: UpdateTransferDto): Promise<Transfer> {
    const transfer = await this.findTransferById(id);
    Object.assign(transfer, updateTransferDto);
    return this.transferRepository.save(transfer);
  }

  async deleteTransfer(id: number): Promise<void> {
    const transfer = await this.findTransferById(id);
    transfer.isActive = false;
    await this.transferRepository.save(transfer);
  }

  // ==================== TRANSFER SCHEDULES ====================

  async createTransferSchedule(scheduleData: {
    transferId: number;
    vehicleId: number;
    scheduleDate: Date;
    departureTime: string;
    arrivalTime?: string;
    availableSeats: number;
    specialPrice?: number;
    notes?: string;
  }): Promise<TransferSchedule> {
    // Validate transfer and vehicle exist
    const [transfer, vehicle] = await Promise.all([
      this.findTransferById(scheduleData.transferId),
      this.findTransferVehicleById(scheduleData.vehicleId)
    ]);

    if (!transfer || !vehicle) {
      throw new BadRequestException('Transfer or vehicle not found');
    }

    const schedule = this.transferScheduleRepository.create(scheduleData);
    return this.transferScheduleRepository.save(schedule);
  }

  async findTransferSchedules(options: {
    transferId?: number;
    vehicleId?: number;
    dateFrom?: Date;
    dateTo?: Date;
    availableSeatsOnly?: boolean;
  }): Promise<TransferSchedule[]> {
    const queryBuilder = this.transferScheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.transfer', 'transfer')
      .leftJoinAndSelect('schedule.vehicle', 'vehicle')
      .leftJoinAndSelect('schedule.bookings', 'booking')
      .where('schedule.isActive = :isActive', { isActive: true });

    if (options.transferId) {
      queryBuilder.andWhere('schedule.transferId = :transferId', { transferId: options.transferId });
    }

    if (options.vehicleId) {
      queryBuilder.andWhere('schedule.vehicleId = :vehicleId', { vehicleId: options.vehicleId });
    }

    if (options.dateFrom) {
      queryBuilder.andWhere('schedule.scheduleDate >= :dateFrom', { dateFrom: options.dateFrom });
    }

    if (options.dateTo) {
      queryBuilder.andWhere('schedule.scheduleDate <= :dateTo', { dateTo: options.dateTo });
    }

    if (options.availableSeatsOnly) {
      queryBuilder.andWhere('schedule.bookedSeats < schedule.availableSeats');
    }

    return queryBuilder.orderBy('schedule.scheduleDate', 'ASC').getMany();
  }

  // ==================== TRANSFER BOOKINGS ====================

  async createTransferBooking(createTransferBookingDto: CreateTransferBookingDto): Promise<TransferBooking> {
    const schedule = await this.transferScheduleRepository.findOne({
      where: { id: createTransferBookingDto.scheduleId, isActive: true },
      relations: ['transfer', 'vehicle']
    });

    if (!schedule) {
      throw new NotFoundException('Transfer schedule not found');
    }

    // Check available seats
    if (schedule.remainingSeats < createTransferBookingDto.passengerCount) {
      throw new BadRequestException('Not enough available seats');
    }

    // Generate unique booking reference
    const bookingReference = await this.generateBookingReference();

    const booking = this.transferBookingRepository.create({
      ...createTransferBookingDto,
      bookingReference,
      paymentDueDate: createTransferBookingDto.paymentDueDate 
        ? new Date(createTransferBookingDto.paymentDueDate) 
        : undefined
    });

    const savedBooking = await this.transferBookingRepository.save(booking);

    // Update schedule booked seats
    schedule.bookedSeats += createTransferBookingDto.passengerCount;
    await this.transferScheduleRepository.save(schedule);

    return savedBooking;
  }

  async findTransferBookings(options: {
    customerId?: number;
    agentId?: number;
    status?: BookingStatus;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<TransferBooking[]> {
    const queryBuilder = this.transferBookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.schedule', 'schedule')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.agent', 'agent')
      .leftJoinAndSelect('schedule.transfer', 'transfer')
      .leftJoinAndSelect('schedule.vehicle', 'vehicle');

    if (options.customerId) {
      queryBuilder.andWhere('booking.customerId = :customerId', { customerId: options.customerId });
    }

    if (options.agentId) {
      queryBuilder.andWhere('booking.agentId = :agentId', { agentId: options.agentId });
    }

    if (options.status) {
      queryBuilder.andWhere('booking.status = :status', { status: options.status });
    }

    if (options.dateFrom) {
      queryBuilder.andWhere('schedule.scheduleDate >= :dateFrom', { dateFrom: options.dateFrom });
    }

    if (options.dateTo) {
      queryBuilder.andWhere('schedule.scheduleDate <= :dateTo', { dateTo: options.dateTo });
    }

    return queryBuilder.orderBy('booking.createdAt', 'DESC').getMany();
  }

  async findTransferBookingById(id: number): Promise<TransferBooking> {
    const booking = await this.transferBookingRepository.findOne({
      where: { id },
      relations: [
        'schedule',
        'schedule.transfer',
        'schedule.vehicle',
        'customer',
        'agent'
      ]
    });

    if (!booking) {
      throw new NotFoundException('Transfer booking not found');
    }

    return booking;
  }

  async cancelTransferBooking(id: number, reason: string): Promise<TransferBooking> {
    const booking = await this.findTransferBookingById(id);

    if (!booking.canBeCancelled) {
      throw new BadRequestException('Booking cannot be cancelled');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();

    // Update schedule booked seats
    const schedule = await this.transferScheduleRepository.findOne({
      where: { id: booking.scheduleId }
    });

    if (schedule) {
      schedule.bookedSeats -= booking.passengerCount;
      await this.transferScheduleRepository.save(schedule);
    }

    return this.transferBookingRepository.save(booking);
  }

  // ==================== UTILITY METHODS ====================

  private async generateBookingReference(): Promise<string> {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const reference = `TRF${timestamp}${random}`;

    // Check if reference already exists
    const existing = await this.transferBookingRepository.findOne({
      where: { bookingReference: reference }
    });

    if (existing) {
      return this.generateBookingReference(); // Recursive call if collision
    }

    return reference;
  }

  async getTransferStatistics(): Promise<{
    totalTransfers: number;
    activeTransfers: number;
    totalBookings: number;
    todayBookings: number;
    totalRevenue: number;
    vehicleUtilization: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalTransfers,
      activeTransfers,
      totalBookings,
      todayBookings,
      revenueResult,
      totalVehicles,
      activeSchedules
    ] = await Promise.all([
      this.transferRepository.count(),
      this.transferRepository.count({ where: { isActive: true } }),
      this.transferBookingRepository.count(),
      this.transferBookingRepository.count({
        where: {
          createdAt: Between(today, tomorrow)
        }
      }),
      this.transferBookingRepository
        .createQueryBuilder('booking')
        .select('SUM(booking.totalPrice)', 'total')
        .getRawOne(),
      this.transferVehicleRepository.count({ where: { isActive: true } }),
      this.transferScheduleRepository.count({
        where: {
          scheduleDate: MoreThanOrEqual(today),
          isActive: true
        }
      })
    ]);

    return {
      totalTransfers,
      activeTransfers,
      totalBookings,
      todayBookings,
      totalRevenue: parseFloat(revenueResult?.total || '0'),
      vehicleUtilization: totalVehicles > 0 ? (activeSchedules / totalVehicles) * 100 : 0
    };
  }
}