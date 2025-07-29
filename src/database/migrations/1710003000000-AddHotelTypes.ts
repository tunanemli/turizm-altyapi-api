import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHotelTypes1710003000000 implements MigrationInterface {
  name = 'AddHotelTypes1710003000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hotel types table
    await queryRunner.query(`
      CREATE TABLE hotel_types (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(255),
        color VARCHAR(255),
        features JSON,
        sortOrder INT NOT NULL DEFAULT 0,
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        INDEX idx_hotel_types_active (isActive),
        INDEX idx_hotel_types_sort (sortOrder)
      ) ENGINE=InnoDB
    `);

    // Insert default hotel types
    await queryRunner.query(`
      INSERT INTO hotel_types (name, description, features, sortOrder) VALUES
      ('Şehir Oteli', 'Şehir merkezinde konumlanmış modern oteller', JSON_ARRAY('WiFi', 'Klima', 'Otopark', 'Resepsiyon 24/7'), 1),
      ('Resort Otel', 'Tatil köyü tarzında her şey dahil oteller', JSON_ARRAY('Plaj', 'Havuz', 'Animasyon', 'Spa', 'Restoranlar'), 2),
      ('Bungalov', 'Doğa içinde müstakil bungalov tarzı konaklama', JSON_ARRAY('Doğa Manzarası', 'Özel Bahçe', 'Şömine', 'Barbekü'), 3),
      ('Butik Otel', 'Küçük ve özel tasarımlı oteller', JSON_ARRAY('Özel Tasarım', 'Kişisel Hizmet', 'Lüks', 'Az Oda'), 4),
      ('Pansiyon', 'Aile işletmesi tarzında sıcak ortam', JSON_ARRAY('Ev Yemekleri', 'Samimi Ortam', 'Uygun Fiyat'), 5),
      ('Villa', 'Özel villa tarzı konaklama', JSON_ARRAY('Özel Havuz', 'Bahçe', 'Mutfak', 'Tamamen Özel'), 6),
      ('Kamp', 'Doğa içinde kamp deneyimi', JSON_ARRAY('Çadır', 'Doğa', 'Kamp Ateşi', 'Yürüyüş'), 7),
      ('Termal Otel', 'Termal sularla sağlık turizmi', JSON_ARRAY('Termal Havuz', 'Spa', 'Sağlık', 'Tedavi'), 8)
    `);

    // Add hotelTypeId column to hotels table
    await queryRunner.query(`
      ALTER TABLE hotels 
      ADD COLUMN hotelTypeId INT,
      ADD FOREIGN KEY (hotelTypeId) REFERENCES hotel_types(id) ON DELETE SET NULL,
      ADD INDEX idx_hotels_type (hotelTypeId)
    `);

    // Set default hotel type for existing hotels (Şehir Oteli)
    await queryRunner.query(`
      UPDATE hotels SET hotelTypeId = 1 WHERE hotelTypeId IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key and column from hotels table
    await queryRunner.query(`
      ALTER TABLE hotels 
      DROP FOREIGN KEY hotels_ibfk_2,
      DROP INDEX idx_hotels_type,
      DROP COLUMN hotelTypeId
    `);

    // Drop hotel_types table
    await queryRunner.query(`DROP TABLE hotel_types`);
  }
}