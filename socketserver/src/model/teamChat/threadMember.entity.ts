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
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { TeamChatThreadMessageEntity, TEAMCHAT_THREAD_TYPE } from '.'
import { OrganizationEntity, UserEntity } from '../organization'
// import { TeamChatDirectMessageEntity } from './directMessage.entity'
// import { TeamChatHQMessageEntity } from './hqMessage.entity'
// import { TeamChatChannelMessageEntity } from './message.entity'

@Unique(['threadId', 'memberId'])
@Entity({ name: 'teamchat_thread_member' })
export class TeamChatThreadMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  threadId: string
  @Column({ default: TEAMCHAT_THREAD_TYPE.CHANNEL })
  type: TEAMCHAT_THREAD_TYPE

  @Column()
  @JoinColumn()
  memberId: string
  @ManyToOne(() => UserEntity)
  member: UserEntity

  @Column({ nullable: false, default: false, name: 'is_owner' })
  isOwner: boolean

  @Column()
  @JoinColumn()
  threadMessageId: string
  @ManyToOne(() => TeamChatThreadMessageEntity)
  threadMessage: TeamChatThreadMessageEntity

  @Column()
  @JoinColumn()
  organizationId: string
  @ManyToOne(() => OrganizationEntity)
  organization: OrganizationEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
