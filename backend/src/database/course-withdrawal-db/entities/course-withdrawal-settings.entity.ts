import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'course_withdrawal_settings' })
@Index(['courseId'], { unique: true })
export class CourseWithdrawalSetting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  courseId!: number;

  @Column({
    type: 'timestamp with time zone',
  })
  startAt!: Date;

  @Column({
    type: 'timestamp with time zone',
  })
  endAt!: Date;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  noticeDelta?: object;

  @Column({
    default: true,
  })
  enabled!: boolean;

  @Column()
  createdBy!: number;

  @Column()
  updatedBy!: number;

  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
  })
  updatedAt!: Date;
}
