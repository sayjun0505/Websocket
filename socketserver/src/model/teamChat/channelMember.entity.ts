import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { OrganizationEntity, UserEntity } from '../organization'
import { TeamChatChannelEntity } from '.'

@Entity({ name: 'teamchat_channel_member' })
export class TeamChatChannelMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @JoinColumn()
  channelId: string
  @Column()
  @JoinColumn()
  memberId: string

  @ManyToOne(() => TeamChatChannelEntity)
  channel: TeamChatChannelEntity

  @ManyToOne(() => UserEntity)
  member: UserEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  createdBy: string
}
