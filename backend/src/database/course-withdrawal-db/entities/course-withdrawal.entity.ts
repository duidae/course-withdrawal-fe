import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseWithdrawalStatus } from './course-withdrawal-status.enum';

@Entity({ name: 'course_withdrawals' })
@Index(['canvasUserId', 'courseId'], { unique: true })
export class CourseWithdrawal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  canvasUserId!: number;

  @Column()
  courseId!: number;

  @Column({ length: 255 })
  sectionId!: string;

  @Column({ length: 255 })
  sectionName!: string;

  @Column({
    type: 'enum',
    enum: CourseWithdrawalStatus,
    default: CourseWithdrawalStatus.Pending,
  })
  status!: CourseWithdrawalStatus;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ length: 255, nullable: true })
  reviewerId?: string;

  @Column({ type: 'text', nullable: true })
  reviewComment?: string;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  reviewedAt?: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
