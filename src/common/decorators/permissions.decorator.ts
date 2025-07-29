import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequirePermission = (permission: string) =>
  SetMetadata(PERMISSIONS_KEY, [permission]);

export const RequireAnyPermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, { any: permissions });

export const RequireAllPermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, { all: permissions });

// Convenience decorators for common permissions
export const AdminOnly = () => RequirePermission('system.admin');
export const ManagerOnly = () => RequireAnyPermission('system.admin', 'users.manage_roles');

// Module-specific decorators
export const HotelManagement = () => RequireAnyPermission(
  'hotels.create',
  'hotels.update', 
  'hotels.delete',
  'hotels.manage_rooms',
  'hotels.manage_prices'
);

export const TourManagement = () => RequireAnyPermission(
  'tours.create',
  'tours.update',
  'tours.delete',
  'tours.manage_schedules',
  'tours.manage_prices'
);

export const TransferManagement = () => RequireAnyPermission(
  'transfers.create',
  'transfers.update',
  'transfers.delete',
  'transfers.manage_schedules',
  'transfers.manage_vehicles'
);

export const UserManagement = () => RequireAnyPermission(
  'users.create',
  'users.update',
  'users.delete',
  'users.manage_roles'
);

export const ReservationManagement = () => RequireAnyPermission(
  'reservations.create',
  'reservations.update',
  'reservations.cancel',
  'reservations.manage_payments'
);

export const ReportAccess = () => RequireAnyPermission(
  'reports.view_sales',
  'reports.view_bookings',
  'reports.view_analytics',
  'reports.export'
);