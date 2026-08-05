import { RoleType } from '@ntucool/nestjs-canvas-api';
import { AuthUser } from '@ntucool/nestjs-canvas-lms-auth';

export type LtiAuthUser = AuthUser & {
  canvasUserId: number;
  courseId: number;
  roles: RoleType[];
  courseName: string;
};
