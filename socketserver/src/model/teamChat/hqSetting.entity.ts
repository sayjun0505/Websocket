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

@Entity({ name: 'teamchat_hq_setting' })
export class TeamChatHQSettingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  readAt: Date

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
}
