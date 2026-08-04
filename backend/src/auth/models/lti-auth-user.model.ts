import { RoleType } from '@ntucool/nestjs-canvas-api';
import { AuthUser } from '@ntucool/nestjs-canvas-lms-auth';

// TODO: Add more fields to the LtiAuthUser type as needed,
//  e.g. enrollments, courseIds, courseSectionIds, permissions etc
export type LtiAuthUser = AuthUser & {
  canvasUserId: number;
  roles: RoleType[];
  courseName: string;
};
