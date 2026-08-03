import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'course_withdrawals' })
@Index(['studentId', 'courseId'], { unique: false })
export class CourseWithdrawal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  studentId!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  courseId!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  courseName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  studentName?: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  applyTime?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  deadline?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  reviewTime?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reviewer?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdDate!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedDate!: Date;
}
