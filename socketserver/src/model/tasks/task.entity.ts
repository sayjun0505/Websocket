import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

import { OrganizationEntity, OrganizationUserEntity, UserEntity } from '../organization'
import { TaskTagEntity } from '.'

@Unique(['organization', 'id'])
@Entity({ name: 'task' })
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false, default: '' })
  type: string

  @Column({ nullable: false, default: '' })
  title: string

  @Column({ nullable: false, default: '' })
  notes: string

  @Column({ nullable: false, default: 0 })
  priority: number

  // @CreateDateColumn({ nullable: true, name: 'start_at' })
  // startDate: Date
  @UpdateDateColumn({ nullable: true, name: 'due_at' })
  dueDate: Date

  // @Column({ nullable: false, default: false, name: 'is_starred' })
  // starred: boolean

  @Column({ nullable: false, default: false, name: 'is_important' })
  important: boolean

  @Column({ nullable: false, default: false, name: 'is_completed' })
  completed: boolean

  // @Column("simple-array", { default: [] })
  // tags: string[];

  @ManyToMany(() => TaskTagEntity, (taskTag) => taskTag.task, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'task_task_tag' })
  tags: TaskTagEntity[]

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'assigned_to' })
  assignedTo: UserEntity

  @Column({ nullable: false, default: 0, name: 'order_index' })
  orderIndex: number

  // @Column({ nullable: false, default: '' })
  // userId: string

  // @Column({ nullable: false, default: '' })
  // cardId: string

  // @Column({ nullable: false, default: '' })
  // chatId: string

  @OneToMany(
    () => OrganizationUserEntity,
    (organizationUser) => organizationUser.user,
  )
  organizationUser!: OrganizationUserEntity[]

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
