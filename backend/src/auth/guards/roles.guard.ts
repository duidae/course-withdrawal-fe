import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType } from '@ntucool/nestjs-canvas-api';
import { ForbiddenError } from '../../shared/errors';
import { type LtiAuthUser } from '../models/lti-auth-user.model';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: LtiAuthUser; params: Record<string, string> }>();
    const hasRequiredRole = requiredRoles.some((role) =>
      request.user?.roles.includes(role),
    );

    if (!hasRequiredRole) {
      throw new ForbiddenError();
    }

    const { courseId } = request.params;
    if (courseId !== undefined && Number(courseId) !== request.user?.courseId) {
      throw new ForbiddenError();
    }

    return true;
  }
}
