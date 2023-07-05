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
import { TeamChatThreadMessageEntity } from './threadMessage.entity'

export enum DR_MESSAGE_TYPE {
  AUDIO = 'audio',
  FILE = 'file',
  IMAGE = 'image',
  LOCATION = 'location',
  STICKER = 'sticker',
  TEXT = 'text',
  UNKNOWN = 'unknown',
  VIDEO = 'video',
}
@Entity({ name: 'teamchat_direct_messages' })
export class TeamChatDirectMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  data: string

  @Column({ default: false, name: 'is_pin' })
  isPin: boolean

  @Column({ default: DR_MESSAGE_TYPE.TEXT })
  type: DR_MESSAGE_TYPE

  @Column({ nullable: true })
  @JoinColumn()
  sendUserId: string
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'send' })
  sendUser: UserEntity

  @Column({ nullable: true })
  @JoinColumn()
  receiveUserId: string
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'receive' })
  receiveUser: UserEntity

  @Column({ default: false, name: 'is_edit' })
  isEdit: boolean

  @Column({ default: false, name: 'is_reply' })
  isReply: boolean

  @Column({ default: false, name: 'is_delete' })
  isDelete: boolean

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn()
  organization: OrganizationEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
