import { OAuth2UserEntity } from '@ntucool/nestjs-canvas-lms-auth';
import { CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User extends OAuth2UserEntity {
  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  createdDate!: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
  })
  updatedDate!: Date;
}
