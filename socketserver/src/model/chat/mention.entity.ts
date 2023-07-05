import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

import { ChatCommentEntity } from './'
import { OrganizationEntity, UserEntity } from '../organization'
import { ChatEntity } from './chat.entity'

@Unique(['comment', 'user'])
@Entity({ name: 'mention' })
export class MentionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string
  @Column()
  chatId: string

  @ManyToOne(() => UserEntity, (user) => user.mention)
  @JoinColumn()
  user: UserEntity
  @ManyToOne(() => ChatEntity, (chat) => chat.mention)
  @JoinColumn()
  chat: ChatEntity

  @ManyToOne(() => ChatCommentEntity, (comment) => comment.mention)
  @JoinColumn()
  comment: ChatCommentEntity

  @Column({ nullable: false, default: false, name: 'is_read' })
  isRead: boolean

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
