import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { UserEntity } from '../organization'
@Entity({ name: 'notification_token' })
export class NotificationTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false, unique: true })
  token: string

  @Column()
  @JoinColumn()
  userId: string
  @ManyToOne(() => UserEntity)
  user: UserEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
