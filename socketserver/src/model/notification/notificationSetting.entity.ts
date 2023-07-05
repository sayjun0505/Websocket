import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

import { OrganizationEntity, UserEntity } from '../organization'
@Entity({ name: 'notification_setting' })
@Unique('NotificationSetting unique', ['token', 'user'])
export class NotificationSettingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  token: string

  @Column()
  @JoinColumn()
  userId: string
  @ManyToOne(() => UserEntity)
  user: UserEntity

  // Chat app Settings
  @Column({
    type: 'simple-json',
    default: {
      newChat: true, // New chat
      newMessage: true, // New message on chat that owner
      mention: true, // New mention on Chat's comment
      owner: true, // Change Chat owner
    },
  })
  chat: {
    newChat: boolean
    newMessage: boolean
    mention: boolean
    owner: boolean
  }

  // Teamchat app Settings
  @Column({
    type: 'simple-json',
    default: {
      addMember: true, // Added to member of channel
      newHQMessage: false, // New HQ message
      newChannelMessage: false, // New channel message
      newDirectMessage: true, // New direct message
      mention: true, // New mention on channel
    },
  })
  teamchat: {
    addMember: boolean
    newHQMessage: boolean
    newChannelMessage: boolean
    newDirectMessage: boolean
    mention: boolean
  }

  // Scrumboard app Settings
  @Column({
    type: 'simple-json',
    default: {
      addCardMember: true, // Added to member of card
      mention: true, // New mention on card comment
    },
  })
  scrumboard: {
    addCardMember: boolean
    mention: boolean
  }

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
