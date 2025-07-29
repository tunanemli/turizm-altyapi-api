import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransfersSystem1710007000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Transfer Types Table
    await queryRunner.query(`
      CREATE TABLE transfer_types (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY unique_transfer_type_name (name),
        INDEX idx_transfer_type_active (isActive)
      ) ENGINE=InnoDB
    `);

    // Transfer Vehicles Table
    await queryRunner.query(`
      CREATE TABLE transfer_vehicles (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        vehicleType ENUM('minibus', 'bus', 'vip_car', 'luxury_car', 'van', 'shuttle') NOT NULL,
        capacity INT NOT NULL,
        features JSON DEFAULT NULL,
        plateNumber VARCHAR(20),
        model VARCHAR(100),
        year INT,
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        INDEX idx_vehicle_type (vehicleType),
        INDEX idx_vehicle_capacity (capacity),
        INDEX idx_vehicle_active (isActive)
      ) ENGINE=InnoDB
    `);

    // Transfer Routes Table
    await queryRunner.query(`
      CREATE TABLE transfer_routes (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        fromLocation VARCHAR(255) NOT NULL,
        toLocation VARCHAR(255) NOT NULL,
        distance DECIMAL(8,2),
        estimatedDuration INT COMMENT 'Duration in minutes',
        waypoints JSON DEFAULT NULL,
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        INDEX idx_route_from (fromLocation),
        INDEX idx_route_to (toLocation),
        INDEX idx_route_active (isActive)
      ) ENGINE=InnoDB
    `);

    // Transfers Table
    await queryRunner.query(`
      CREATE TABLE transfers (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        transferTypeId INT NOT NULL,
        routeId INT,
        fromHotelId INT,
        toHotelId INT,
        tourId INT,
        isRoundTrip BOOLEAN NOT NULL DEFAULT false,
        status ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active',
        features JSON DEFAULT NULL,
        notes TEXT,
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        FOREIGN KEY (transferTypeId) REFERENCES transfer_types(id) ON DELETE RESTRICT,
        FOREIGN KEY (routeId) REFERENCES transfer_routes(id) ON DELETE SET NULL,
        FOREIGN KEY (fromHotelId) REFERENCES hotels(id) ON DELETE SET NULL,
        FOREIGN KEY (toHotelId) REFERENCES hotels(id) ON DELETE SET NULL,
        FOREIGN KEY (tourId) REFERENCES tours(id) ON DELETE SET NULL,
        INDEX idx_transfer_type (transferTypeId),
        INDEX idx_transfer_route (routeId),
        INDEX idx_transfer_from_hotel (fromHotelId),
        INDEX idx_transfer_to_hotel (toHotelId),
        INDEX idx_transfer_tour (tourId),
        INDEX idx_transfer_status (status),
        INDEX idx_transfer_active (isActive)
      ) ENGINE=InnoDB
    `);

    // Transfer Prices Table
    await queryRunner.query(`
      CREATE TABLE transfer_prices (
        id INT NOT NULL AUTO_INCREMENT,
        transferId INT NOT NULL,
        vehicleId INT NOT NULL,
        priceType ENUM('per_person', 'per_vehicle', 'per_group') NOT NULL DEFAULT 'per_person',
        basePrice DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
        validFrom DATE NOT NULL,
        validTo DATE,
        minPassengers INT DEFAULT 1,
        maxPassengers INT,
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        FOREIGN KEY (transferId) REFERENCES transfers(id) ON DELETE CASCADE,
        FOREIGN KEY (vehicleId) REFERENCES transfer_vehicles(id) ON DELETE RESTRICT,
        INDEX idx_transfer_price_transfer (transferId),
        INDEX idx_transfer_price_vehicle (vehicleId),
        INDEX idx_transfer_price_type (priceType),
        INDEX idx_transfer_price_dates (validFrom, validTo),
        INDEX idx_transfer_price_active (isActive)
      ) ENGINE=InnoDB
    `);

    // Transfer Schedules Table
    await queryRunner.query(`
      CREATE TABLE transfer_schedules (
        id INT NOT NULL AUTO_INCREMENT,
        transferId INT NOT NULL,
        vehicleId INT NOT NULL,
        departureTime TIME NOT NULL,
        arrivalTime TIME,
        departureDate DATE NOT NULL,
        availableSeats INT NOT NULL,
        bookedSeats INT NOT NULL DEFAULT 0,
        status ENUM('scheduled', 'departed', 'arrived', 'cancelled', 'delayed') NOT NULL DEFAULT 'scheduled',
        notes TEXT,
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        FOREIGN KEY (transferId) REFERENCES transfers(id) ON DELETE CASCADE,
        FOREIGN KEY (vehicleId) REFERENCES transfer_vehicles(id) ON DELETE RESTRICT,
        INDEX idx_schedule_transfer (transferId),
        INDEX idx_schedule_vehicle (vehicleId),
        INDEX idx_schedule_date (departureDate),
        INDEX idx_schedule_time (departureTime),
        INDEX idx_schedule_status (status),
        INDEX idx_schedule_active (isActive)
      ) ENGINE=InnoDB
    `);

    // Transfer Bookings Table
    await queryRunner.query(`
      CREATE TABLE transfer_bookings (
        id INT NOT NULL AUTO_INCREMENT,
        scheduleId INT NOT NULL,
        customerId INT NOT NULL,
        agentId INT,
        passengerCount INT NOT NULL DEFAULT 1,
        totalPrice DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
        paymentStatus ENUM('pending', 'paid', 'refunded', 'cancelled') NOT NULL DEFAULT 'pending',
        bookingStatus ENUM('confirmed', 'pending', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
        passengerDetails JSON DEFAULT NULL,
        specialRequests TEXT,
        pickupLocation VARCHAR(255),
        dropoffLocation VARCHAR(255),
        bookingReference VARCHAR(50) UNIQUE,
        notes TEXT,
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        FOREIGN KEY (scheduleId) REFERENCES transfer_schedules(id) ON DELETE RESTRICT,
        FOREIGN KEY (customerId) REFERENCES users(id) ON DELETE RESTRICT,
        FOREIGN KEY (agentId) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_booking_schedule (scheduleId),
        INDEX idx_booking_customer (customerId),
        INDEX idx_booking_agent (agentId),
        INDEX idx_booking_payment_status (paymentStatus),
        INDEX idx_booking_status (bookingStatus),
        INDEX idx_booking_reference (bookingReference),
        INDEX idx_booking_active (isActive)
      ) ENGINE=InnoDB
    `);

    // Insert Default Transfer Types
    await queryRunner.query(`
      INSERT INTO transfer_types (name, description, icon) VALUES
      ('Havalimanı Transfer', 'Havalimanından otel/otelinden havalimanına transfer', 'plane'),
      ('Otel Transfer', 'Otel arası transfer hizmeti', 'hotel'),
      ('Tur Transfer', 'Tur için özel transfer hizmeti', 'route'),
      ('Şehir İçi Transfer', 'Şehir içi ulaşım hizmeti', 'city'),
      ('VIP Transfer', 'Özel lüks araç transfer hizmeti', 'crown'),
      ('Grup Transfer', 'Grup için otobüs/minibüs hizmeti', 'users')
    `);

    // Insert Default Transfer Vehicles
    await queryRunner.query(`
      INSERT INTO transfer_vehicles (name, vehicleType, capacity, features) VALUES
      ('Mercedes Sprinter', 'minibus', 14, JSON_ARRAY('klima', 'wifi', 'usb_sarj')),
      ('Volkswagen Crafter', 'minibus', 16, JSON_ARRAY('klima', 'ses_sistemi')),
      ('Mercedes Vito', 'van', 8, JSON_ARRAY('klima', 'deri_koltuk', 'wifi')),
      ('BMW X5', 'vip_car', 4, JSON_ARRAY('deri_koltuk', 'klima', 'navigasyon', 'premium_ses')),
      ('Mercedes E-Class', 'luxury_car', 4, JSON_ARRAY('deri_koltuk', 'klima', 'wifi', 'sofor')),
      ('Temsa Safari', 'bus', 50, JSON_ARRAY('klima', 'tv', 'ses_sistemi', 'wc'))
    `);

    // Insert Default Transfer Routes
    await queryRunner.query(`
      INSERT INTO transfer_routes (name, fromLocation, toLocation, distance, estimatedDuration) VALUES
      ('Antalya Havalimanı - Kemer', 'Antalya Havalimanı', 'Kemer', 65.5, 75),
      ('Antalya Havalimanı - Belek', 'Antalya Havalimanı', 'Belek', 35.2, 45),
      ('Antalya Havalimanı - Side', 'Antalya Havalimanı', 'Side', 70.8, 80),
      ('Antalya Havalimanı - Alanya', 'Antalya Havalimanı', 'Alanya', 125.3, 120),
      ('Kemer - Belek', 'Kemer', 'Belek', 95.7, 90),
      ('Belek - Side', 'Belek', 'Side', 45.6, 50)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order due to foreign key dependencies
    await queryRunner.query(`DROP TABLE transfer_bookings`);
    await queryRunner.query(`DROP TABLE transfer_schedules`);
    await queryRunner.query(`DROP TABLE transfer_prices`);
    await queryRunner.query(`DROP TABLE transfers`);
    await queryRunner.query(`DROP TABLE transfer_routes`);
    await queryRunner.query(`DROP TABLE transfer_vehicles`);
    await queryRunner.query(`DROP TABLE transfer_types`);
  }
}