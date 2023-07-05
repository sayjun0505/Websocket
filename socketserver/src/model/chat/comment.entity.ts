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
  UpdateDateColumn,
} from 'typeorm'
import { OrganizationEntity, UserEntity } from '../organization'
import { ChatEntity, MentionEntity } from '.'

export enum CHAT_COMMENT_TYPE {
  TEXT = 'text',
  IMAGE = 'image',
}
@Entity({ name: 'chat_comment' })
export class ChatCommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  data: string

  @Column({ default: false, name: 'is_pin' })
  isPin: boolean

  @Column()
  chatId: string
  @ManyToOne(() => ChatEntity)
  @JoinColumn()
  chat: ChatEntity

  @Column({ default: CHAT_COMMENT_TYPE.TEXT })
  type: CHAT_COMMENT_TYPE

  @OneToMany(() => MentionEntity, (mention) => mention.user, {
    nullable: true,
  })
  mention: MentionEntity[]

  @Column()
  organizationId: string
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
