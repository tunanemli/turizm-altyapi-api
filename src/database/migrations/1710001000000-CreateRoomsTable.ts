import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoomsTable1710001000000 implements MigrationInterface {
  name = 'CreateRoomsTable1710001000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rooms table - Gerçek fiziksel odaları temsil eder
    await queryRunner.query(`
      CREATE TABLE rooms (
        id INT NOT NULL AUTO_INCREMENT,
        roomNumber VARCHAR(255) NOT NULL,
        roomCode VARCHAR(255),
        floor INT,
        hotelId INT NOT NULL,
        roomTypeId INT NOT NULL,
        status ENUM('available', 'occupied', 'maintenance', 'blocked', 'out_of_order') NOT NULL DEFAULT 'available',
        lastMaintenance DATE,
        nextMaintenance DATE,
        notes TEXT,
        features JSON,
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        FOREIGN KEY (hotelId) REFERENCES hotels(id) ON DELETE CASCADE,
        FOREIGN KEY (roomTypeId) REFERENCES room_types(id) ON DELETE RESTRICT,
        UNIQUE KEY unique_room_per_hotel (hotelId, roomNumber),
        INDEX idx_hotel_status (hotelId, status),
        INDEX idx_room_type (roomTypeId),
        INDEX idx_status (status)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE rooms`);
  }
}