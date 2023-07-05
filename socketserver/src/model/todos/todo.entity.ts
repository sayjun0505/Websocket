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
import { TodoLabelEntity } from '.'

@Unique(['organization', 'id'])
@Entity({ name: 'todo' })
export class TodoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  // @Column()
  // uid: string

  @Column({ nullable: false, default: '' })
  title: string

  @Column({ nullable: false, default: '' })
  notes: string

  @Column({ nullable: false, default: '' })
  userId: string

  @Column({ nullable: false, default: '' })
  cardId: string

  @Column({ nullable: false, default: '' })
  chatId: string

  @CreateDateColumn({ nullable: true, name: 'start_at' })
  startDate: Date
  @UpdateDateColumn({ nullable: true, name: 'due_at' })
  dueDate: Date

  @Column({ nullable: false, default: false, name: 'is_starred' })
  starred: boolean

  @Column({ nullable: false, default: false, name: 'is_important' })
  important: boolean

  @Column({ nullable: false, default: false, name: 'is_completed' })
  completed: boolean

  // @Column("simple-array", { default: [] })
  // labels: string[];

  @ManyToMany(
    () => TodoLabelEntity,
    (todoLabel) => todoLabel.todo,
    { cascade: true, onDelete: 'CASCADE' }
  )
  @JoinTable({ name: 'todo_todo_label' })
  labels: TodoLabelEntity[]

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
