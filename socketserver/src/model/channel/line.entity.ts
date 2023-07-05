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
import { ChannelEntity } from '.'
// import { CHANNEL_STATUS } from '.'
import { OrganizationEntity, UserEntity } from '../organization'

// @Unique('Name unique per organization', ['organization', 'name'])
@Entity({ name: 'line_channel' })
export class LineChannelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  name: string

  @Column({ name: 'line_id', nullable: true })
  lineId: string

  @Column({ name: 'access_token', nullable: false })
  accessToken: string

  @Column({ name: 'channel_secret', nullable: false})
  channelSecret: string

  @OneToOne(() => ChannelEntity)
  channel: ChannelEntity

  // @Column({ nullable: false, default: CHANNEL_STATUS.ACTIVE })
  // status: CHANNEL_STATUS

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
