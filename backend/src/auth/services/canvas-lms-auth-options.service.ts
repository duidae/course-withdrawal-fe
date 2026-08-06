import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CanvasLmsAuthModuleOptions,
  CanvasLmsAuthModuleOptionsFactory,
  Ltiv1p3Profile,
  TypeormTokenStorage,
} from '@ntucool/nestjs-canvas-lms-auth';
import { Repository } from 'typeorm';

import { CanvasLmsAuthSessionManager } from './canvas-lms-auth-session.manager';
import { CourseWithdrawalDbName } from 'src/database/course-withdrawal-db/config/db.config';
import { User } from '../../database/course-withdrawal-db/entities/user.entity';

@Injectable()
export class CanvasLmsAuthOptionsService implements CanvasLmsAuthModuleOptionsFactory {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User, CourseWithdrawalDbName)
    private userRepository: Repository<User>,
    private authSessionManager: CanvasLmsAuthSessionManager,
  ) {}

  createOptions(): Promise<CanvasLmsAuthModuleOptions> {
    return Promise.resolve({
      app: { url: new URL(this.configService.getOrThrow<string>('app.host')) },
      canvas: { url: new URL(this.configService.getOrThrow<string>('canvas.host')) },
      ltiv1p3: this.createLtiv1p3LtiOptions(),
      oAuth2: this.createOAuth2Options(),
      session: this.authSessionManager,
    });
  }

  private createLtiv1p3LtiOptions(): Ltiv1p3Profile {
    return {
      clientId: this.configService.getOrThrow<string>('auth.ltiv1p3.clientId'),
      deploymentIds: this.configService.getOrThrow<string[]>(
        'auth.ltiv1p3.deploymentIds',
      ),
      oidcAuthUrl: this.configService.getOrThrow<string>('auth.ltiv1p3.oidcAuthUrl'),
      jwksUrl: this.configService.getOrThrow<string>('auth.ltiv1p3.jwksUrl'),
      issuer: this.configService.getOrThrow<string>('auth.ltiv1p3.issuer'),
      secret: this.configService.getOrThrow<string>('auth.ltiv1p3.secret'),
      config: {
        customFields: {
          locale: '$Message.locale',
          account_id: '$Canvas.account.id',
          user_id: '$Canvas.user.id',
          sis_user_id: '$Canvas.user.sisSourceId',
          user_name: '$Person.name.full',
          user_login_id: '$Canvas.user.loginId',
          course_id: '$Canvas.course.id',
          course_name: '$Canvas.course.name',
          sis_course_id: '$Canvas.course.sisSourceId',
          section_ids: '$Canvas.course.sectionIds',
        },
      },
    };
  }

  private createOAuth2Options() {
    return {
      clientID: this.configService.getOrThrow<string>('auth.oauth2.clientId'),
      clientSecret: this.configService.getOrThrow<string>('auth.oauth2.clientSecret'),
      tokenStorage: new TypeormTokenStorage(this.userRepository),
    };
  }
}
