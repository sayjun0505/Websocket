import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { OrganizationEntity, UserEntity } from '../organization'
import { TaskEntity } from '.'

@Unique('Task_tag_organization', ['title', 'organization'])
@Entity({ name: 'task_tag' })
export class TaskTagEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  title: string

  @ManyToMany(() => TaskEntity, (task) => task.tags)
  task: TaskEntity[]

  @Column({ nullable: false, default: false, name: 'is_delete' })
  isDelete: boolean

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn()
  organization: OrganizationEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  createdBy: UserEntity

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: UserEntity
}
