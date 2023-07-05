import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { OrganizationEntity, UserEntity } from '../organization'

export enum TEAMCHAT_HQ_MESSAGE_TYPE {
  AUDIO = 'audio',
  FILE = 'file',
  IMAGE = 'image',
  LOCATION = 'location',
  STICKER = 'sticker',
  TEXT = 'text',
  UNKNOWN = 'unknown',
  VIDEO = 'video',
}
@Entity({ name: 'teamchat_hq_message' })
export class TeamChatHQMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  data: string

  @Column({ default: TEAMCHAT_HQ_MESSAGE_TYPE.TEXT })
  type: TEAMCHAT_HQ_MESSAGE_TYPE

  @Column({ default: false, name: 'is_pin' })
  isPin: boolean

  @Column({ default: false, name: 'is_edit' })
  isEdit: boolean

  @Column({ default: false, name: 'is_reply' })
  isReply: boolean

  @Column({ default: false, name: 'is_delete' })
  isDelete: boolean

  @Column()
  @JoinColumn()
  organizationId: string
  @ManyToOne(() => OrganizationEntity)
  organization: OrganizationEntity

  @Column({ nullable: true })
  @JoinColumn()
  createdById: string
  @ManyToOne(() => UserEntity)
  // @JoinColumn({ name: 'created_by' })
  createdBy: UserEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
  // @UpdateDateColumn({ name: 'updated_at' })
  // updatedAt: Date
}
