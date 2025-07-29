import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmptyMigration1710006000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Bu migration boş - sadece sırayı korumak için
    // Hiçbir değişiklik yapmaz
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Bu migration boş - geri alınacak hiçbir şey yok
  }
}