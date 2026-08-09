import { Req, Logger, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import { Launch, Ltiv1p3Launcher, Ltiv1p3Payload } from '@ntucool/nestjs-canvas-lms-auth';
import type { LtiLaunchResponse } from '@ntucool/nestjs-canvas-lms-auth';
import { Ltiv1p3LaunchData } from '@ntucool/nestjs-canvas-lms-auth/dist/interfaces/lti-launch-data.interface.js';
import { RoleType } from '@ntucool/nestjs-canvas-api';

import { LtiAuthUser } from '../models/lti-auth-user.model';
import { CanvasLmsAuthSessionManager } from '../services/canvas-lms-auth-session.manager';

@Ltiv1p3Launcher()
export class CanvasLmsAuthLauncherLtiv1p3 {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private configService: ConfigService,
    private sessionManager: CanvasLmsAuthSessionManager,
  ) {}

  @Launch('launch/:page')
  defaultPage(
    @Req() request: Request,
    @Ltiv1p3Payload() lti: Ltiv1p3LaunchData,
    @Param('page') page: string,
  ): LtiLaunchResponse {
    const currentLaunchLtiAuthUser = this.getLtiAuthUser(page, lti);

    const previousLaunchLtiAuthUser = this.sessionManager
      .getSession(request)
      .getLtiContext() as LtiAuthUser;

    const finalLtiAuthUser = this.combineLtiAuthUser(
      previousLaunchLtiAuthUser,
      currentLaunchLtiAuthUser,
    );

    this.logger.log(`User context: ${JSON.stringify(finalLtiAuthUser)}`);

    return {
      context: finalLtiAuthUser,
      targetUrl: this.getPageTargetUrl(page, {
        locale: lti.locale,
        lti,
      }),
    };
  }

  private combineLtiAuthUser(
    target: LtiAuthUser | undefined,
    assign: LtiAuthUser,
  ): LtiAuthUser {
    if (
      !target ||
      target.canvasUserId !== assign.canvasUserId ||
      target.courseId !== assign.courseId
    ) {
      return assign;
    }

    return {
      ...target,
      ...assign,
      roles: [...new Set([...target.roles, ...assign.roles])],
      isRootAdmin: target.isRootAdmin || assign.isRootAdmin,
    };
  }

  private getPageTargetUrl(
    page: string,
    params: { locale: string; lti: Ltiv1p3LaunchData },
  ): URL {
    const appUrl = new URL(this.configService.getOrThrow<string>('app.host'));
    const courseId = params.lti.courseId ? String(params.lti.courseId) : 'course';
    const roles = (params.lti.roles ?? []).map((role: string) => String(role).toLowerCase());

    let resultURL: URL;

    if (roles.includes('admin')) {
      resultURL = new URL(`${appUrl.origin}/admin`);
    } else if (roles.includes('teacher')) {
      resultURL = new URL(`${appUrl.origin}/courses/${courseId}/teacher`);
    } else if (roles.includes('student')) {
      resultURL = new URL(`${appUrl.origin}/courses/${courseId}/student`);
    } else {
      switch (page) {
        case 'admin':
          resultURL = new URL(`${appUrl.origin}/admin`);
          break;
        case 'teacher':
          resultURL = new URL(`${appUrl.origin}/courses/${courseId}/teacher`);
          break;
        case 'student':
          resultURL = new URL(`${appUrl.origin}/courses/${courseId}/student`);
          break;
        case 'course':
        default:
          resultURL = new URL(`${appUrl.origin}/courses/${courseId}/student`);
          break;
      }
    }

    resultURL.searchParams.set('locale', params.locale);

    return resultURL;
  }

  private getLtiAuthUser(page: string, lti: Ltiv1p3LaunchData): LtiAuthUser {
    switch (page) {
      // TODO: Add and update course-withdrawal page (eg. admin, course) context
      case 'admin':
      case 'course':
      case 'teacher':
      case 'student':
        return this.getContext(lti);
      default:
        throw new Error(`Unsupported page: ${page}`);
    }
  }

  private getContext(lti: Ltiv1p3LaunchData): LtiAuthUser {
    const userId = parseInt(lti.userId as string, 10);
    const courseId = Number(lti.courseId);
    const roles = this.getRoles(lti.roles);
    const loginId =
      (lti.userLoginId as string | undefined) ??
      (lti.user_login_id as string | undefined) ??
      undefined;

    return {
      canvasUserId: userId,
      courseId,
      loginId,
      roles,
      courseName: (lti.courseName as string | undefined) ?? '',
      userName: (lti.userName as string | undefined) ?? '',
    };
  }

  private getRoles(roles: string[]): RoleType[] {
    const roleMap: Record<string, RoleType> = {
      admin: RoleType.AccountAdmin,
      teacher: RoleType.TeacherEnrollment,
      student: RoleType.StudentEnrollment,
    };

    return roles
      .map((role) => roleMap[role])
      .filter((role): role is RoleType => role !== undefined);
  }
}
