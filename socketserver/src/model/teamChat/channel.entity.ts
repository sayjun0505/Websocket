import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { OrganizationEntity, UserEntity } from '../organization'
import { TeamChatChannelMemberEntity, TeamChatChannelMessageEntity } from './'

@Entity({ name: 'teamchat_channel' })
export class TeamChatChannelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  name: string

  @Column({ nullable: false })
  description: string

  @Column({ nullable: false, default: false, name: 'is_public' })
  isPublic: boolean

  @Column({ nullable: false, default: false, name: 'is_delete' })
  isDelete: boolean

  @OneToMany(() => TeamChatChannelMessageEntity, (message) => message.channel)
  messages: TeamChatChannelMessageEntity[]

  @OneToMany(() => TeamChatChannelMemberEntity, (member) => member.channel)
  members: TeamChatChannelMemberEntity[]

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
