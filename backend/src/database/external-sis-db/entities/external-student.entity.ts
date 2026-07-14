import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExternalSchool } from './external-school.entity';

@Entity({ name: 'external_students' })
export class ExternalStudent {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'login_id', nullable: false, unique: true })
  loginId: string;

  @Column({ name: 'school_code', nullable: false })
  schoolCode: string;

  @ManyToOne(() => ExternalSchool, (school) => school.students, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'school_code', referencedColumnName: 'code' })
  school: ExternalSchool;

  @Column({ name: 'reg_no', nullable: false })
  regNo: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
