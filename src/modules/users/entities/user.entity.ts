import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from './role.entity';
import { UserPermission } from './user-permission.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  department: string;

  @Column({ default: 'user' })
  role: string; // Backward compatibility için tutuyoruz

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @ManyToMany(() => Role, role => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToMany(() => UserPermission, userPermission => userPermission.user)
  userPermissions: UserPermission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Helper methods
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  hasRole(roleName: string): boolean {
    return this.roles?.some(role => role.name === roleName) || false;
  }

  hasPermission(permissionName: string): boolean {
    // Check role-based permissions
    const hasRolePermission = this.roles?.some(role => 
      role.rolePermissions?.some(rp => rp.permission.name === permissionName && rp.isActive)
    ) || false;

    // Check user-specific permissions (override)
    const userPermission = this.userPermissions?.find(up => 
      up.permission.name === permissionName && up.isActive &&
      (!up.expiresAt || up.expiresAt > new Date())
    );

    if (userPermission) {
      return userPermission.isGranted;
    }

    return hasRolePermission;
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  getEffectivePermissions(): string[] {
    const rolePermissions = this.roles?.flatMap(role => 
      role.rolePermissions?.filter(rp => rp.isActive).map(rp => rp.permission.name) || []
    ) || [];

    const userPermissions = this.userPermissions?.filter(up => 
      up.isActive && (!up.expiresAt || up.expiresAt > new Date())
    ) || [];

    // Apply user permission overrides
    const effectivePermissions = new Set(rolePermissions);
    
    userPermissions.forEach(up => {
      if (up.isGranted) {
        effectivePermissions.add(up.permission.name);
      } else {
        effectivePermissions.delete(up.permission.name);
      }
    });

    return Array.from(effectivePermissions);
  }
} 