import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { OrganizationEntity, UserEntity } from '../organization'

export enum NOTIFICATION_TYPE {
  CHAT = 'chat',
  TEAMCHAT = 'teamchat',
  SCRUMBOARD = 'scrumboard',
}
export enum NOTIFICATION_EVENT {
  // Chat event
  NEW_CHAT = 'newChat',
  NEW_MESSAGE = 'newMessage',
  NEW_OWNER = 'newOwner',
  NEW_MENTION = 'newMention',
  // TeamChat
  ADD_MEMBER = 'addMember',
  NEW_CHANNEL_MESSAGE = 'newChannelMessage',
  NEW_DIRECT_MESSAGE = 'newDirectMessage',
  NEW_HQ_MESSAGE = 'newHQMessage',

  NEW_CHANNEL_MENTION = 'newChannelMention',
  NEW_HQ_MENTION = 'newHQMention',

  NEW_THREAD = 'newThread',
  NEW_THREAD_CHANNEL_MESSAGE = 'newThreadChannelMessage',
  NEW_THREAD_DIRECT_MESSAGE = 'newThreadDirectMessage',
  NEW_THREAD_HQ_MESSAGE = 'newThreadHQMessage',
  // Scrumboard
  NEW_BOARD_MEMBER = 'newBoardMember',
  NEW_CARD_MEMBER = 'newCardMember',
  NEW_CARD_MENTION = 'newCardMention',
  NEW_CARD_DUE_DATE = 'newCardDueDate',
  EDIT_CARD_DUE_DATE = 'editCardDueDate',
}

@Entity({ name: 'notification' })
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    nullable: true,
  })
  data: string

  @Column({ nullable: false })
  type: NOTIFICATION_TYPE

  @Column({ nullable: false })
  event: NOTIFICATION_EVENT

  @Column({ default: false, name: 'is_read' })
  isRead: boolean

  @Column()
  @JoinColumn()
  userId: string
  @ManyToOne(() => UserEntity)
  user: UserEntity

  @Column()
  @JoinColumn()
  organizationId: string
  @ManyToOne(() => OrganizationEntity)
  organization: OrganizationEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
