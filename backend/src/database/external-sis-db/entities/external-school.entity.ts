import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ExternalStudent } from './external-student.entity';

@Entity({ name: 'external_schools' })
export class ExternalSchool {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'code', nullable: false, unique: true })
  code: string;

  @Column({ name: 'zh_name', nullable: false, unique: true })
  zhName: string;

  @Column({ name: 'abbr', nullable: false })
  abbr: string;

  @OneToMany(() => ExternalStudent, (student) => student.school)
  students: ExternalStudent[];

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
