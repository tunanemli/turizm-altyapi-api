import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateToursSchema1710002000000 implements MigrationInterface {
  name = 'CreateToursSchema1710002000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tour categories table
    await queryRunner.query(`
      CREATE TABLE tour_categories (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(255),
        color VARCHAR(255),
        sortOrder INT NOT NULL DEFAULT 0,
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        INDEX idx_tour_categories_active (isActive),
        INDEX idx_tour_categories_sort (sortOrder)
      ) ENGINE=InnoDB
    `);

    // Tours table
    await queryRunner.query(`
      CREATE TABLE tours (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        shortDescription TEXT,
        categoryId INT,
        duration INT NOT NULL,
        maxGroupSize INT NOT NULL,
        minGroupSize INT NOT NULL,
        basePrice DECIMAL(10,2) NOT NULL,
        currency VARCHAR(255) NOT NULL,
        difficulty ENUM('easy', 'moderate', 'challenging', 'extreme') NOT NULL DEFAULT 'easy',
        status ENUM('active', 'inactive', 'draft', 'archived') NOT NULL DEFAULT 'active',
        startLocation VARCHAR(255) NOT NULL,
        endLocation VARCHAR(255) NOT NULL,
        includedServices JSON,
        excludedServices JSON,
        requirements JSON,
        highlights JSON,
        rating INT NOT NULL DEFAULT 0,
        reviewCount INT NOT NULL DEFAULT 0,
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        FOREIGN KEY (categoryId) REFERENCES tour_categories(id) ON DELETE SET NULL,
        INDEX idx_tours_category (categoryId),
        INDEX idx_tours_status (status),
        INDEX idx_tours_active (isActive),
        INDEX idx_tours_difficulty (difficulty),
        INDEX idx_tours_price (basePrice),
        INDEX idx_tours_rating (rating)
      ) ENGINE=InnoDB
    `);

    // Tour itinerary table
    await queryRunner.query(`
      CREATE TABLE tour_itinerary (
        id INT NOT NULL AUTO_INCREMENT,
        tourId INT NOT NULL,
        dayNumber INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        activities TEXT,
        accommodation VARCHAR(255),
        meals VARCHAR(255),
        transportation VARCHAR(255),
        startTime TIME,
        endTime TIME,
        locations JSON,
        notes JSON,
        sortOrder INT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        FOREIGN KEY (tourId) REFERENCES tours(id) ON DELETE CASCADE,
        INDEX idx_tour_itinerary_tour (tourId),
        INDEX idx_tour_itinerary_day (dayNumber),
        INDEX idx_tour_itinerary_sort (sortOrder)
      ) ENGINE=InnoDB
    `);

    // Tour prices table
    await queryRunner.query(`
      CREATE TABLE tour_prices (
        id INT NOT NULL AUTO_INCREMENT,
        tourId INT NOT NULL,
        priceType ENUM('adult', 'child', 'infant', 'senior', 'student', 'group') NOT NULL DEFAULT 'adult',
        price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(255) NOT NULL,
        validFrom DATE NOT NULL,
        validTo DATE NOT NULL,
        minGroupSize INT,
        maxGroupSize INT,
        discountPercentage DECIMAL(5,2),
        seasonName VARCHAR(255),
        conditions JSON,
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        FOREIGN KEY (tourId) REFERENCES tours(id) ON DELETE CASCADE,
        INDEX idx_tour_prices_tour (tourId),
        INDEX idx_tour_prices_type (priceType),
        INDEX idx_tour_prices_date (validFrom, validTo),
        INDEX idx_tour_prices_active (isActive)
      ) ENGINE=InnoDB
    `);

    // Tour availability table
    await queryRunner.query(`
      CREATE TABLE tour_availability (
        id INT NOT NULL AUTO_INCREMENT,
        tourId INT NOT NULL,
        startDate DATE NOT NULL,
        endDate DATE NOT NULL,
        totalSpots INT NOT NULL,
        availableSpots INT NOT NULL,
        reservedSpots INT NOT NULL DEFAULT 0,
        status ENUM('available', 'sold_out', 'cancelled', 'suspended') NOT NULL DEFAULT 'available',
        guideId INT,
        guideName VARCHAR(255),
        specialPrice DECIMAL(10,2),
        specialPriceCurrency VARCHAR(255),
        notes TEXT,
        cancellationReason VARCHAR(255),
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        FOREIGN KEY (tourId) REFERENCES tours(id) ON DELETE CASCADE,
        INDEX idx_tour_availability_tour (tourId),
        INDEX idx_tour_availability_date (startDate, endDate),
        INDEX idx_tour_availability_status (status),
        INDEX idx_tour_availability_active (isActive)
      ) ENGINE=InnoDB
    `);

    // Tour images table
    await queryRunner.query(`
      CREATE TABLE tour_images (
        id INT NOT NULL AUTO_INCREMENT,
        url VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        description TEXT,
        imageType VARCHAR(255) NOT NULL,
        sortOrder INT NOT NULL DEFAULT 0,
        isActive BOOLEAN NOT NULL DEFAULT true,
        altText VARCHAR(255),
        dayNumber INT,
        tourId INT NOT NULL,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        FOREIGN KEY (tourId) REFERENCES tours(id) ON DELETE CASCADE,
        INDEX idx_tour_images_tour (tourId),
        INDEX idx_tour_images_type (imageType),
        INDEX idx_tour_images_day (dayNumber),
        INDEX idx_tour_images_sort (sortOrder)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE tour_images`);
    await queryRunner.query(`DROP TABLE tour_availability`);
    await queryRunner.query(`DROP TABLE tour_prices`);
    await queryRunner.query(`DROP TABLE tour_itinerary`);
    await queryRunner.query(`DROP TABLE tours`);
    await queryRunner.query(`DROP TABLE tour_categories`);
  }
}