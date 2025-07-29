import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixHotelFeatures1710005000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if hotel_features table exists, create if not
    const hotelFeaturesExists = await queryRunner.hasTable('hotel_features');
    if (!hotelFeaturesExists) {
      await queryRunner.query(`
        CREATE TABLE hotel_features (
          id INT NOT NULL AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100) NOT NULL,
          icon VARCHAR(100),
          isActive BOOLEAN NOT NULL DEFAULT true,
          createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (id),
          UNIQUE KEY unique_feature_name (name),
          INDEX idx_category (category),
          INDEX idx_active (isActive)
        ) ENGINE=InnoDB
      `);
    }

    // Check if features column exists in hotels table, add if not
    const hotelsColumns = await queryRunner.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hotels' AND COLUMN_NAME = 'features'
    `);
    if (hotelsColumns.length === 0) {
      await queryRunner.query(`ALTER TABLE hotels ADD COLUMN features JSON DEFAULT NULL`);
    }

    // Check if features column exists in hotel_types table, add if not
    const hotelTypesColumns = await queryRunner.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hotel_types' AND COLUMN_NAME = 'features'
    `);
    if (hotelTypesColumns.length === 0) {
      await queryRunner.query(`ALTER TABLE hotel_types ADD COLUMN features JSON DEFAULT NULL`);
    }

    // Check if features are already inserted
    const featureCount = await queryRunner.query(`SELECT COUNT(*) as count FROM hotel_features`);
    if (featureCount[0].count === 0) {
      // Insert technology features
      await queryRunner.query(`
        INSERT INTO hotel_features (name, description, category, icon) VALUES
        ('WiFi', 'Ücretsiz kablosuz internet', 'technology', 'wifi'),
        ('Klima', 'Oda kliması', 'technology', 'snowflake'),
        ('TV', 'Düz ekran TV', 'technology', 'tv'),
        ('Minibar', 'Oda minibarı', 'technology', 'wine-glass'),
        ('Kasa', 'Oda kasası', 'technology', 'lock')
      `);

      // Insert facility features
      await queryRunner.query(`
        INSERT INTO hotel_features (name, description, category, icon) VALUES
        ('Havuz', 'Yüzme havuzu', 'facility', 'swimming-pool'),
        ('Spa', 'Spa merkezi', 'facility', 'spa'),
        ('Fitness', 'Fitness merkezi', 'facility', 'dumbbell'),
        ('Sauna', 'Sauna', 'facility', 'hot-tub'),
        ('Çocuk Oyun Alanı', 'Çocuklar için oyun alanı', 'facility', 'child')
      `);

      // Insert service features
      await queryRunner.query(`
        INSERT INTO hotel_features (name, description, category, icon) VALUES
        ('24/7 Resepsiyon', '24 saat resepsiyon hizmeti', 'service', 'clock'),
        ('Oda Servisi', 'Oda servisi', 'service', 'room-service'),
        ('Çamaşırhane', 'Çamaşırhane hizmeti', 'service', 'washing-machine'),
        ('Vale Park', 'Vale park hizmeti', 'service', 'car'),
        ('Concierge', 'Concierge hizmeti', 'service', 'concierge-bell')
      `);

      // Insert amenity features
      await queryRunner.query(`
        INSERT INTO hotel_features (name, description, category, icon) VALUES
        ('Restoran', 'Restoran', 'amenity', 'utensils'),
        ('Bar', 'Bar', 'amenity', 'glass-martini'),
        ('Kahvaltı', 'Kahvaltı dahil', 'amenity', 'coffee'),
        ('Otopark', 'Ücretsiz otopark', 'amenity', 'parking'),
        ('Transfer', 'Havalimanı transferi', 'amenity', 'shuttle-van')
      `);

      // Insert accessibility features
      await queryRunner.query(`
        INSERT INTO hotel_features (name, description, category, icon) VALUES
        ('Engelli Erişimi', 'Engelli misafirler için uygun', 'accessibility', 'wheelchair'),
        ('Asansör', 'Asansör', 'accessibility', 'elevator'),
        ('Hayvan Dostu', 'Evcil hayvan kabul edilir', 'accessibility', 'paw'),
        ('Sigara İçilmez', 'Sigara içilmeyen odalar', 'accessibility', 'smoking-ban'),
        ('Aile Odaları', 'Aile odaları mevcut', 'accessibility', 'users')
      `);

      // Update hotel types with default features
      await queryRunner.query(`
        UPDATE hotel_types SET features = JSON_ARRAY(
          (SELECT id FROM hotel_features WHERE name = 'WiFi'),
          (SELECT id FROM hotel_features WHERE name = 'Klima'),
          (SELECT id FROM hotel_features WHERE name = 'TV'),
          (SELECT id FROM hotel_features WHERE name = '24/7 Resepsiyon'),
          (SELECT id FROM hotel_features WHERE name = 'Otopark')
        )
        WHERE name = 'Otel' AND (features IS NULL OR JSON_LENGTH(features) = 0)
      `);

      await queryRunner.query(`
        UPDATE hotel_types SET features = JSON_ARRAY(
          (SELECT id FROM hotel_features WHERE name = 'WiFi'),
          (SELECT id FROM hotel_features WHERE name = 'Klima'),
          (SELECT id FROM hotel_features WHERE name = 'TV'),
          (SELECT id FROM hotel_features WHERE name = 'Havuz'),
          (SELECT id FROM hotel_features WHERE name = 'Spa'),
          (SELECT id FROM hotel_features WHERE name = 'Restoran'),
          (SELECT id FROM hotel_features WHERE name = 'Kahvaltı')
        )
        WHERE name = 'Resort' AND (features IS NULL OR JSON_LENGTH(features) = 0)
      `);

      await queryRunner.query(`
        UPDATE hotel_types SET features = JSON_ARRAY(
          (SELECT id FROM hotel_features WHERE name = 'WiFi'),
          (SELECT id FROM hotel_features WHERE name = 'Klima'),
          (SELECT id FROM hotel_features WHERE name = 'TV'),
          (SELECT id FROM hotel_features WHERE name = 'Havuz'),
          (SELECT id FROM hotel_features WHERE name = 'Restoran')
        )
        WHERE name = 'Bungalov' AND (features IS NULL OR JSON_LENGTH(features) = 0)
      `);

      await queryRunner.query(`
        UPDATE hotel_types SET features = JSON_ARRAY(
          (SELECT id FROM hotel_features WHERE name = 'WiFi'),
          (SELECT id FROM hotel_features WHERE name = '24/7 Resepsiyon'),
          (SELECT id FROM hotel_features WHERE name = 'Otopark')
        )
        WHERE name = 'Pansiyon' AND (features IS NULL OR JSON_LENGTH(features) = 0)
      `);

      await queryRunner.query(`
        UPDATE hotel_types SET features = JSON_ARRAY(
          (SELECT id FROM hotel_features WHERE name = 'WiFi'),
          (SELECT id FROM hotel_features WHERE name = '24/7 Resepsiyon'),
          (SELECT id FROM hotel_features WHERE name = 'Otopark')
        )
        WHERE name = 'Hostel' AND (features IS NULL OR JSON_LENGTH(features) = 0)
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if columns exist before dropping
    const hotelsColumns = await queryRunner.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hotels' AND COLUMN_NAME = 'features'
    `);
    if (hotelsColumns.length > 0) {
      await queryRunner.query(`ALTER TABLE hotels DROP COLUMN features`);
    }

    const hotelTypesColumns = await queryRunner.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hotel_types' AND COLUMN_NAME = 'features'
    `);
    if (hotelTypesColumns.length > 0) {
      await queryRunner.query(`ALTER TABLE hotel_types DROP COLUMN features`);
    }
    
    const hotelFeaturesExists = await queryRunner.hasTable('hotel_features');
    if (hotelFeaturesExists) {
      await queryRunner.query(`DROP TABLE hotel_features`);
    }
  }
}