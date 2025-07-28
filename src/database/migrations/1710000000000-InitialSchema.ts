import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
    await queryRunner.query(`
      CREATE TABLE users (
        id INT NOT NULL AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL DEFAULT 'user',
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);

    // Hotels table
    await queryRunner.query(`
      CREATE TABLE hotels (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        chainName VARCHAR(255),
        brandName VARCHAR(255),
        description TEXT NOT NULL,
        starRating INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        website VARCHAR(255),
        checkInTime VARCHAR(255) NOT NULL,
        checkOutTime VARCHAR(255) NOT NULL,
        country VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        postalCode VARCHAR(255),
        latitude DECIMAL(10,7) NOT NULL,
        longitude DECIMAL(10,7) NOT NULL,
        facilities JSON NOT NULL,
        policies JSON NOT NULL,
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);

    // Room types table
    await queryRunner.query(`
      CREATE TABLE room_types (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        baseOccupancy INT NOT NULL,
        maxOccupancy INT NOT NULL,
        maxAdult INT NOT NULL,
        maxChild INT NOT NULL,
        roomSize INT NOT NULL,
        roomSizeUnit VARCHAR(255) NOT NULL,
        isSmoking BOOLEAN NOT NULL DEFAULT false,
        facilities JSON NOT NULL,
        bedTypes JSON NOT NULL,
        basePrice DECIMAL(10,2) NOT NULL,
        currency VARCHAR(255) NOT NULL,
        extraBedPolicy JSON NOT NULL,
        hotelId INT,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        FOREIGN KEY (hotelId) REFERENCES hotels(id)
      ) ENGINE=InnoDB
    `);

    // Room prices table
    await queryRunner.query(`
      CREATE TABLE room_prices (
        id INT NOT NULL AUTO_INCREMENT,
        roomTypeId INT,
        startDate DATE NOT NULL,
        endDate DATE NOT NULL,
        ratePlan VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(255) NOT NULL,
        mealPlan JSON NOT NULL,
        cancellationPolicy JSON NOT NULL,
        isRefundable BOOLEAN NOT NULL DEFAULT true,
        minStay INT NOT NULL DEFAULT 1,
        maxStay INT,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        FOREIGN KEY (roomTypeId) REFERENCES room_types(id)
      ) ENGINE=InnoDB
    `);

    // Room inventory table
    await queryRunner.query(`
      CREATE TABLE room_inventory (
        id INT NOT NULL AUTO_INCREMENT,
        roomTypeId INT,
        date DATE NOT NULL,
        totalRooms INT NOT NULL,
        availableRooms INT NOT NULL,
        blockedRooms INT NOT NULL DEFAULT 0,
        blockReason VARCHAR(255),
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        FOREIGN KEY (roomTypeId) REFERENCES room_types(id)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE room_inventory`);
    await queryRunner.query(`DROP TABLE room_prices`);
    await queryRunner.query(`DROP TABLE room_types`);
    await queryRunner.query(`DROP TABLE hotels`);
    await queryRunner.query(`DROP TABLE users`);
  }
} 