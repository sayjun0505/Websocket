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
// import { CHANNEL, CHAT_STATUS } from '../../config/constant'

import { ChatCommentEntity, MessageEntity } from '../chat'
import { OrganizationEntity, UserEntity } from '../organization'
import { CustomerEntity } from '../customer'
import { ChannelEntity } from '../channel'
import { ChantActivityEntity, MentionEntity } from '.'
import { ScrumboardCardEntity } from '../scrumboard'

export enum CHAT_STATUS {
  // NONE = 'none',
  RESOLVED = 'resolved',
  OPEN = 'open',
}
@Entity({ name: 'chat' })
export class ChatEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false, default: CHAT_STATUS.OPEN })
  status: CHAT_STATUS

  @Column()
  channelId: string
  @ManyToOne(() => ChannelEntity)
  @JoinColumn()
  channel: ChannelEntity

  @Column({ nullable: true })
  description: string

  @Column()
  customerId: string
  @ManyToOne(() => CustomerEntity, (customer) => customer.chat)
  customer: CustomerEntity

  @OneToMany(() => MessageEntity, (message) => message.chat)
  message: MessageEntity[]

  @OneToMany(() => ChatCommentEntity, (comment) => comment.chat)
  comment: ChatCommentEntity[]

  @Column({ nullable: false, default: false })
  followup: boolean

  @Column({ nullable: false, default: false })
  archived: boolean

  @Column({ nullable: false, default: false })
  spam: boolean

  @Column({ nullable: true })
  ownerId: string
  @ManyToOne(() => UserEntity)
  @JoinColumn()
  owner: UserEntity

  @OneToMany(() => MentionEntity, (mention) => mention.chat)
  mention: MentionEntity[]

  @OneToMany(() => ChantActivityEntity, (activity) => activity.chat)
  activity: ChantActivityEntity[]

  @OneToOne(() => ScrumboardCardEntity, (card) => card.chat)
  card: ScrumboardCardEntity

  @Column({ nullable: false, default: false, name: 'is_delete' })
  isDelete: boolean

  @Column()
  organizationId: string
  @ManyToOne(() => OrganizationEntity)
  @JoinColumn()
  organization: OrganizationEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @Column({ nullable: true })
  createdById: string
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  createdBy: UserEntity

  @Column({ nullable: true })
  updatedById: string
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: UserEntity
}
