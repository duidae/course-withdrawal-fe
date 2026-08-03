import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'course_withdrawals' })
@Index(['studentId', 'courseId'], { unique: true })
export class CourseWithdrawal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  studentId!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  courseId!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  studentName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status?: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reviewer?: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdDate!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedDate!: Date;
}
