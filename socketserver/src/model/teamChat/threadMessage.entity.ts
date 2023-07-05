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
// import { TeamChatDirectMessageEntity } from './directMessage.entity'
// import { TeamChatHQMessageEntity } from './hqMessage.entity'
// import { TeamChatChannelMessageEntity } from './message.entity'

export enum TEAMCHAT_THREAD_TYPE {
  HQ = 'hq',
  CHANNEL = 'channel',
  DIRECT = 'direct',
}

export enum TEAMCHAT_TR_MESSAGE_TYPE {
  AUDIO = 'audio',
  FILE = 'file',
  IMAGE = 'image',
  LOCATION = 'location',
  STICKER = 'sticker',
  TEXT = 'text',
  UNKNOWN = 'unknown',
  VIDEO = 'video',
}
@Entity({ name: 'teamchat_thread_message' })
export class TeamChatThreadMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  data: string

  @Column({ default: TEAMCHAT_TR_MESSAGE_TYPE.TEXT })
  type: TEAMCHAT_TR_MESSAGE_TYPE

  @Column({ nullable: false })
  threadId: string
  @Column({ default: TEAMCHAT_THREAD_TYPE.CHANNEL })
  threadType: TEAMCHAT_THREAD_TYPE

  @Column()
  @JoinColumn()
  organizationId: string
  @ManyToOne(() => OrganizationEntity)
  organization: OrganizationEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @Column({ nullable: true })
  createdById: string
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  createdBy: UserEntity
}
