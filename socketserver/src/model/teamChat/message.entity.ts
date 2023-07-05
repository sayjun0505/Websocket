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
import { TeamChatChannelEntity } from './channel.entity'

export enum TEAMCHAT_MESSAGE_TYPE {
  AUDIO = 'audio',
  FILE = 'file',
  IMAGE = 'image',
  LOCATION = 'location',
  STICKER = 'sticker',
  TEXT = 'text',
  UNKNOWN = 'unknown',
  VIDEO = 'video',
}
@Entity({ name: 'teamchat_channel_message' })
export class TeamChatChannelMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  data: string

  @Column({ default: false, name: 'is_pin' })
  isPin: boolean

  @Column()
  @JoinColumn()
  channelId: string
  @ManyToOne(() => TeamChatChannelEntity, { nullable: true })
  @JoinColumn()
  channel: TeamChatChannelEntity

  @Column({ default: TEAMCHAT_MESSAGE_TYPE.TEXT })
  type: TEAMCHAT_MESSAGE_TYPE

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn()
  organization: OrganizationEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @Column({ nullable: true })
  @JoinColumn()
  createdById: string
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  createdBy: UserEntity

  @Column({ nullable: true })
  @JoinColumn()
  updatedById: string
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: UserEntity

  @Column({ default: false, name: 'is_delete' })
  isDelete: boolean

  @Column({ default: false, name: 'is_edit' })
  isEdit: boolean

  @Column({ default: false, name: 'is_reply' })
  isReply: boolean
}
