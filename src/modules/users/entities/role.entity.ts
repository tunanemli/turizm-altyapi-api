import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  description: string;

  @Column('json', { nullable: true })
  permissions: string[]; // Backward compatibility için tutuyoruz

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => User, user => user.roles)
  users: User[];

  @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
  rolePermissions: RolePermission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  hasPermission(permissionName: string): boolean {
    return this.rolePermissions?.some(rp => 
      rp.permission.name === permissionName && rp.isActive
    ) || false;
  }

  getPermissionNames(): string[] {
    return this.rolePermissions?.filter(rp => rp.isActive).map(rp => rp.permission.name) || [];
  }
} 