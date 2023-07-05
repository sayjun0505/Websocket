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

import { OrganizationEntity, UserEntity } from '../organization'
import { TeamChatChannelEntity } from './channel.entity'

@Entity({ name: 'teamchat_message_mention' })
export class TeamChatMentionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  readAt: Date

  @Column({ nullable: true })
  @JoinColumn()
  userId: string
  @ManyToOne(() => UserEntity, { nullable: true })
  user: UserEntity

  @Column({ nullable: true })
  @JoinColumn()
  channelId: string
  @ManyToOne(() => TeamChatChannelEntity, { nullable: true })
  @JoinColumn()
  channel: TeamChatChannelEntity

  @ManyToOne(() => OrganizationEntity, { nullable: true })
  @JoinColumn()
  organization: OrganizationEntity
}
