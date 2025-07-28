import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { User } from '../users/entities/user.entity';
import { Hotel } from '../hotels/entities/hotel.entity';
import { RoomType } from '../hotels/entities/room-type.entity';
import { RoomInventory } from '../hotels/entities/room-inventory.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto, CancelReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    @InjectRepository(RoomType)
    private readonly roomTypeRepository: Repository<RoomType>,
    @InjectRepository(RoomInventory)
    private readonly roomInventoryRepository: Repository<RoomInventory>,
  ) {}

  async createReservation(
    createReservationDto: CreateReservationDto,
    agentId?: number,
  ): Promise<Reservation> {
    const { 
      hotelId, 
      roomTypeId, 
      checkInDate, 
      checkOutDate, 
      customerId,
      ...reservationData 
    } = createReservationDto;

    // Validate dates
    if (checkInDate >= checkOutDate) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }

    // Check hotel exists
    const hotel = await this.hotelRepository.findOne({ where: { id: hotelId } });
    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    // Check room type exists
    const roomType = await this.roomTypeRepository.findOne({ where: { id: roomTypeId } });
    if (!roomType) {
      throw new NotFoundException('Room type not found');
    }

    // Check availability
    const isAvailable = await this.checkAvailability(
      roomTypeId,
      checkInDate,
      checkOutDate,
      reservationData.roomCount,
    );

    if (!isAvailable) {
      throw new BadRequestException('Rooms not available for selected dates');
    }

    // Calculate nights and total price
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = roomType.basePrice * nights * reservationData.roomCount;

    // Get or create customer
    let customer: User;
    if (customerId) {
      customer = await this.userRepository.findOne({ where: { id: customerId } });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    } else {
      // Create customer from guest details
      const primaryGuest = reservationData.guestDetails[0];
      customer = await this.userRepository.findOne({ 
        where: { email: primaryGuest.email } 
      });
      
      if (!customer) {
        customer = this.userRepository.create({
          email: primaryGuest.email,
          firstName: primaryGuest.firstName,
          lastName: primaryGuest.lastName,
          phone: primaryGuest.phone,
          password: Math.random().toString(36).slice(-8), // Temporary password
          role: 'customer',
        });
        customer = await this.userRepository.save(customer);
      }
    }

    // Get agent if provided
    let agent: User | undefined;
    if (agentId) {
      agent = await this.userRepository.findOne({ where: { id: agentId } });
    }

    // Generate reservation number
    const reservationNumber = await this.generateReservationNumber();

    // Create reservation
    const reservation = this.reservationRepository.create({
      reservationNumber,
      checkInDate,
      checkOutDate,
      nights,
      totalPrice,
      remainingAmount: totalPrice,
      currency: roomType.currency,
      status: 'pending',
      paymentStatus: 'pending',
      cancellationPolicy: {}, // TODO: Get from room type or hotel
      customer,
      agent,
      hotel,
      roomType,
      ...reservationData,
    });

    const savedReservation = await this.reservationRepository.save(reservation);

    // Update room inventory
    await this.updateRoomInventory(roomTypeId, checkInDate, checkOutDate, reservationData.roomCount, 'reserve');

    return this.findOne(savedReservation.id);
  }

  async findAll(filters?: {
    status?: string;
    customerId?: number;
    agentId?: number;
    hotelId?: number;
    checkInFrom?: Date;
    checkInTo?: Date;
  }): Promise<Reservation[]> {
    const queryBuilder = this.reservationRepository.createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.customer', 'customer')
      .leftJoinAndSelect('reservation.agent', 'agent')
      .leftJoinAndSelect('reservation.hotel', 'hotel')
      .leftJoinAndSelect('reservation.roomType', 'roomType')
      .orderBy('reservation.createdAt', 'DESC');

    if (filters?.status) {
      queryBuilder.where('reservation.status = :status', { status: filters.status });
    }

    if (filters?.customerId) {
      queryBuilder.andWhere('reservation.customerId = :customerId', { customerId: filters.customerId });
    }

    if (filters?.agentId) {
      queryBuilder.andWhere('reservation.agentId = :agentId', { agentId: filters.agentId });
    }

    if (filters?.hotelId) {
      queryBuilder.andWhere('reservation.hotelId = :hotelId', { hotelId: filters.hotelId });
    }

    if (filters?.checkInFrom && filters?.checkInTo) {
      queryBuilder.andWhere('reservation.checkInDate BETWEEN :checkInFrom AND :checkInTo', {
        checkInFrom: filters.checkInFrom,
        checkInTo: filters.checkInTo,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Reservation | null> {
    return this.reservationRepository.findOne({
      where: { id },
      relations: ['customer', 'agent', 'hotel', 'roomType'],
    });
  }

  async findByReservationNumber(reservationNumber: string): Promise<Reservation | null> {
    return this.reservationRepository.findOne({
      where: { reservationNumber },
      relations: ['customer', 'agent', 'hotel', 'roomType'],
    });
  }

  async updateReservation(id: number, updateDto: UpdateReservationDto): Promise<Reservation | null> {
    const reservation = await this.findOne(id);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    await this.reservationRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async cancelReservation(id: number, cancelDto: CancelReservationDto): Promise<Reservation | null> {
    const reservation = await this.findOne(id);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (!reservation.canBeCancelled) {
      throw new BadRequestException('Reservation cannot be cancelled');
    }

    await this.reservationRepository.update(id, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: cancelDto.reason,
    });

    // Release room inventory
    await this.updateRoomInventory(
      reservation.roomType.id,
      reservation.checkInDate,
      reservation.checkOutDate,
      reservation.roomCount,
      'release'
    );

    return this.findOne(id);
  }

  async confirmReservation(id: number): Promise<Reservation | null> {
    const reservation = await this.findOne(id);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const confirmationCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    await this.reservationRepository.update(id, {
      status: 'confirmed',
      confirmationCode,
    });

    return this.findOne(id);
  }

  private async checkAvailability(
    roomTypeId: number,
    checkInDate: Date,
    checkOutDate: Date,
    roomCount: number,
  ): Promise<boolean> {
    const dateRange = this.getDateRange(checkInDate, checkOutDate);
    
    for (const date of dateRange) {
      const inventory = await this.roomInventoryRepository.findOne({
        where: {
          roomType: { id: roomTypeId },
          date,
        },
      });

      if (!inventory || inventory.availableRooms < roomCount) {
        return false;
      }
    }

    return true;
  }

  private async updateRoomInventory(
    roomTypeId: number,
    checkInDate: Date,
    checkOutDate: Date,
    roomCount: number,
    action: 'reserve' | 'release',
  ): Promise<void> {
    const dateRange = this.getDateRange(checkInDate, checkOutDate);
    const change = action === 'reserve' ? -roomCount : roomCount;

    for (const date of dateRange) {
      await this.roomInventoryRepository
        .createQueryBuilder()
        .update()
        .set({
          availableRooms: () => `availableRooms + ${change}`,
        })
        .where('roomTypeId = :roomTypeId AND date = :date', { roomTypeId, date })
        .execute();
    }
  }

  private getDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }

  private async generateReservationNumber(): Promise<string> {
    const prefix = 'RES';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }
} 