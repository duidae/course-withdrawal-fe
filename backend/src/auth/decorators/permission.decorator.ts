import { SetMetadata } from '@nestjs/common';
import { Permission } from '../models/enums/permission.enum';

export const PERMISSIONS_KEY = 'permissions';

export type PermissionRule = [routeParam: string, permission: Permission];

// TODO: no guard reads PERMISSIONS_KEY yet - this only attaches metadata for now.
export const Permissions = (rule: PermissionRule) => SetMetadata(PERMISSIONS_KEY, rule);
