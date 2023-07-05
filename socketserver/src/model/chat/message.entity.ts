import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

// import { CHANNEL, MESSAGE_DIRECTION } from '../../config/constant'
import { ChatEntity } from '../chat'
import { ChannelEntity } from '../channel'
import { OrganizationEntity, UserEntity } from '../organization'

export enum MESSAGE_TYPE {
  AUDIO = 'audio',
  FILE = 'file',
  IMAGE = 'image',
  LOCATION = 'location',
  STICKER = 'sticker',
  TEXT = 'text',
  UNKNOWN = 'unknown',
  VIDEO = 'video',
  BUTTONS = 'buttons',
  CAROUSEL = 'carousel',
  CONFIRM = 'confirm',
  FLEX = 'flex',
  STORY = 'story',
  STORY_IMAGE = 'story_image',
  STORY_VIDEO = 'story_video',
  STORY_MENTION = 'story_mention',
  STORY_IMAGE_MENTION = 'story_image_mention',
  STORY_VIDEO_MENTION = 'story_video_mention',
}
export enum MESSAGE_DIRECTION {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

@Entity({ name: 'message' })
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  mid: string // message Id from channel

  @Column('simple-json', { nullable: true })
  reaction: { reaction: string; emoji: string }

  @Column({ nullable: true })
  replyToId: string
  @ManyToOne(() => MessageEntity)
  @JoinColumn()
  replyTo: MessageEntity

  @Column({ nullable: false })
  data: string

  @Column()
  channelId: string
  @ManyToOne(() => ChannelEntity)
  @JoinColumn()
  channel: ChannelEntity

  @Column({ nullable: false })
  type: MESSAGE_TYPE

  @Column()
  timestamp: Date

  @Column({ default: false, name: 'is_error' })
  isError: boolean

  @Column({ default: false, name: 'is_read' })
  isRead: boolean

  @Column({ default: false, name: 'is_deleted' })
  isDelete: boolean

  @Column({ nullable: false })
  direction: MESSAGE_DIRECTION

  @Column({ nullable: true })
  chatId: string
  @ManyToOne(() => ChatEntity, (chat) => chat.message)
  chat: ChatEntity

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
