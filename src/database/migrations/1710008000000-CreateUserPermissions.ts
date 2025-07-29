import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserPermissions1710008000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if permissions table exists, create if not
    const permissionsExists = await queryRunner.hasTable('permissions');
    if (!permissionsExists) {
      await queryRunner.query(`
        CREATE TABLE permissions (
          id INT NOT NULL AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          module VARCHAR(100) NOT NULL,
          action VARCHAR(100) NOT NULL,
          resource VARCHAR(100),
          isActive BOOLEAN NOT NULL DEFAULT true,
          createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (id),
          UNIQUE KEY unique_permission_name (name),
          INDEX idx_permission_module (module),
          INDEX idx_permission_action (action),
          INDEX idx_permission_active (isActive)
        ) ENGINE=InnoDB
      `);
    }

    // Check if role_permissions table exists, create if not
    const rolePermissionsExists = await queryRunner.hasTable('role_permissions');
    if (!rolePermissionsExists) {
      await queryRunner.query(`
        CREATE TABLE role_permissions (
          id INT NOT NULL AUTO_INCREMENT,
          roleId INT NOT NULL,
          permissionId INT NOT NULL,
          isActive BOOLEAN NOT NULL DEFAULT true,
          createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (id),
          FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE,
          FOREIGN KEY (permissionId) REFERENCES permissions(id) ON DELETE CASCADE,
          UNIQUE KEY unique_role_permission (roleId, permissionId),
          INDEX idx_role_permission_role (roleId),
          INDEX idx_role_permission_permission (permissionId),
          INDEX idx_role_permission_active (isActive)
        ) ENGINE=InnoDB
      `);
    }

    // Check if user_permissions table exists, create if not
    const userPermissionsExists = await queryRunner.hasTable('user_permissions');
    if (!userPermissionsExists) {
      await queryRunner.query(`
        CREATE TABLE user_permissions (
          id INT NOT NULL AUTO_INCREMENT,
          userId INT NOT NULL,
          permissionId INT NOT NULL,
          isGranted BOOLEAN NOT NULL DEFAULT true,
          grantedBy INT,
          grantedAt DATETIME DEFAULT NULL,
          expiresAt DATETIME DEFAULT NULL,
          reason TEXT,
          isActive BOOLEAN NOT NULL DEFAULT true,
          createdAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          updatedAt TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (id),
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (permissionId) REFERENCES permissions(id) ON DELETE CASCADE,
          FOREIGN KEY (grantedBy) REFERENCES users(id) ON DELETE SET NULL,
          UNIQUE KEY unique_user_permission (userId, permissionId),
          INDEX idx_user_permission_user (userId),
          INDEX idx_user_permission_permission (permissionId),
          INDEX idx_user_permission_granted (isGranted),
          INDEX idx_user_permission_expires (expiresAt),
          INDEX idx_user_permission_active (isActive)
        ) ENGINE=InnoDB
      `);
    }

    // Check if permissions are already inserted
    const permissionCount = await queryRunner.query(`SELECT COUNT(*) as count FROM permissions`);
    if (permissionCount[0].count === 0) {
      // Insert Default Permissions

      // User Management Permissions
      await queryRunner.query(`
        INSERT INTO permissions (name, description, module, action, resource) VALUES
        ('users.create', 'Yeni kullanıcı oluşturma', 'users', 'create', 'user'),
        ('users.read', 'Kullanıcıları görüntüleme', 'users', 'read', 'user'),
        ('users.update', 'Kullanıcı bilgilerini güncelleme', 'users', 'update', 'user'),
        ('users.delete', 'Kullanıcı silme', 'users', 'delete', 'user'),
        ('users.manage_roles', 'Kullanıcı rollerini yönetme', 'users', 'manage', 'role')
      `);

      // Hotel Management Permissions
      await queryRunner.query(`
        INSERT INTO permissions (name, description, module, action, resource) VALUES
        ('hotels.create', 'Yeni otel oluşturma', 'hotels', 'create', 'hotel'),
        ('hotels.read', 'Otelleri görüntüleme', 'hotels', 'read', 'hotel'),
        ('hotels.update', 'Otel bilgilerini güncelleme', 'hotels', 'update', 'hotel'),
        ('hotels.delete', 'Otel silme', 'hotels', 'delete', 'hotel'),
        ('hotels.manage_rooms', 'Otel odalarını yönetme', 'hotels', 'manage', 'room'),
        ('hotels.manage_prices', 'Otel fiyatlarını yönetme', 'hotels', 'manage', 'price')
      `);

      // Tour Management Permissions
      await queryRunner.query(`
        INSERT INTO permissions (name, description, module, action, resource) VALUES
        ('tours.create', 'Yeni tur oluşturma', 'tours', 'create', 'tour'),
        ('tours.read', 'Turları görüntüleme', 'tours', 'read', 'tour'),
        ('tours.update', 'Tur bilgilerini güncelleme', 'tours', 'update', 'tour'),
        ('tours.delete', 'Tur silme', 'tours', 'delete', 'tour'),
        ('tours.manage_schedules', 'Tur programlarını yönetme', 'tours', 'manage', 'schedule'),
        ('tours.manage_prices', 'Tur fiyatlarını yönetme', 'tours', 'manage', 'price')
      `);

      // Transfer Management Permissions
      await queryRunner.query(`
        INSERT INTO permissions (name, description, module, action, resource) VALUES
        ('transfers.create', 'Yeni transfer oluşturma', 'transfers', 'create', 'transfer'),
        ('transfers.read', 'Transferleri görüntüleme', 'transfers', 'read', 'transfer'),
        ('transfers.update', 'Transfer bilgilerini güncelleme', 'transfers', 'update', 'transfer'),
        ('transfers.delete', 'Transfer silme', 'transfers', 'delete', 'transfer'),
        ('transfers.manage_schedules', 'Transfer programlarını yönetme', 'transfers', 'manage', 'schedule'),
        ('transfers.manage_vehicles', 'Araçları yönetme', 'transfers', 'manage', 'vehicle')
      `);

      // Reservation Management Permissions
      await queryRunner.query(`
        INSERT INTO permissions (name, description, module, action, resource) VALUES
        ('reservations.create', 'Yeni rezervasyon oluşturma', 'reservations', 'create', 'reservation'),
        ('reservations.read', 'Rezervasyonları görüntüleme', 'reservations', 'read', 'reservation'),
        ('reservations.update', 'Rezervasyon güncelleme', 'reservations', 'update', 'reservation'),
        ('reservations.cancel', 'Rezervasyon iptal etme', 'reservations', 'cancel', 'reservation'),
        ('reservations.manage_payments', 'Ödeme yönetimi', 'reservations', 'manage', 'payment')
      `);

      // Report and Analytics Permissions
      await queryRunner.query(`
        INSERT INTO permissions (name, description, module, action, resource) VALUES
        ('reports.view_sales', 'Satış raporlarını görüntüleme', 'reports', 'view', 'sales'),
        ('reports.view_bookings', 'Rezervasyon raporlarını görüntüleme', 'reports', 'view', 'bookings'),
        ('reports.view_analytics', 'Analiz raporlarını görüntüleme', 'reports', 'view', 'analytics'),
        ('reports.export', 'Rapor export etme', 'reports', 'export', 'data')
      `);

      // System Administration Permissions
      await queryRunner.query(`
        INSERT INTO permissions (name, description, module, action, resource) VALUES
        ('system.admin', 'Sistem yöneticisi tüm yetkiler', 'system', 'admin', 'all'),
        ('system.settings', 'Sistem ayarlarını yönetme', 'system', 'manage', 'settings'),
        ('system.logs', 'Sistem loglarını görüntüleme', 'system', 'view', 'logs'),
        ('system.backup', 'Yedekleme işlemleri', 'system', 'manage', 'backup')
      `);

      // Assign Permissions to Default Roles (only if role_permissions is empty)
      const rolePermissionCount = await queryRunner.query(`SELECT COUNT(*) as count FROM role_permissions`);
      if (rolePermissionCount[0].count === 0) {
        // Super Admin Role (All permissions)
        await queryRunner.query(`
          INSERT INTO role_permissions (roleId, permissionId)
          SELECT 
            (SELECT id FROM roles WHERE name = 'super_admin') as roleId,
            id as permissionId
          FROM permissions
          WHERE isActive = true
        `);

        // Admin Role (Most permissions except system admin)
        await queryRunner.query(`
          INSERT INTO role_permissions (roleId, permissionId)
          SELECT 
            (SELECT id FROM roles WHERE name = 'admin') as roleId,
            id as permissionId
          FROM permissions
          WHERE name NOT IN ('system.admin', 'system.backup', 'system.logs')
          AND isActive = true
        `);

        // Agent Role (Basic operations)
        await queryRunner.query(`
          INSERT INTO role_permissions (roleId, permissionId)
          SELECT 
            (SELECT id FROM roles WHERE name = 'agent') as roleId,
            id as permissionId
          FROM permissions
          WHERE name IN (
            'hotels.read', 'tours.read', 'transfers.read',
            'reservations.create', 'reservations.read', 'reservations.update',
            'reports.view_bookings'
          )
          AND isActive = true
        `);

        // Customer Role (Limited permissions)
        await queryRunner.query(`
          INSERT INTO role_permissions (roleId, permissionId)
          SELECT 
            (SELECT id FROM roles WHERE name = 'customer') as roleId,
            id as permissionId
          FROM permissions
          WHERE name IN (
            'hotels.read', 'tours.read', 'transfers.read',
            'reservations.read'
          )
          AND isActive = true
        `);

        // Manager Role (Department management)
        await queryRunner.query(`
          INSERT INTO role_permissions (roleId, permissionId)
          SELECT 
            (SELECT id FROM roles WHERE name = 'manager') as roleId,
            id as permissionId
          FROM permissions
          WHERE name IN (
            'hotels.create', 'hotels.read', 'hotels.update', 'hotels.manage_rooms', 'hotels.manage_prices',
            'tours.create', 'tours.read', 'tours.update', 'tours.manage_schedules', 'tours.manage_prices',
            'transfers.create', 'transfers.read', 'transfers.update', 'transfers.manage_schedules',
            'reservations.create', 'reservations.read', 'reservations.update', 'reservations.cancel',
            'reports.view_sales', 'reports.view_bookings', 'reports.view_analytics', 'reports.export',
            'users.read'
          )
          AND isActive = true
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if tables exist before dropping
    const userPermissionsExists = await queryRunner.hasTable('user_permissions');
    if (userPermissionsExists) {
      await queryRunner.query(`DROP TABLE user_permissions`);
    }

    const rolePermissionsExists = await queryRunner.hasTable('role_permissions');
    if (rolePermissionsExists) {
      await queryRunner.query(`DROP TABLE role_permissions`);
    }

    const permissionsExists = await queryRunner.hasTable('permissions');
    if (permissionsExists) {
      await queryRunner.query(`DROP TABLE permissions`);
    }
  }
}