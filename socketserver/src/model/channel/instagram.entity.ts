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
@Entity({ name: 'instagram_channel' })
export class InstagramChannelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  name: string

  @Column({ nullable: false })
  pageId: string

  @Column({ nullable: false, default: '' })
  fbPageId: string

  @Column({ nullable: false })
  accessToken: string

  @OneToOne(() => ChannelEntity)
  channel: ChannelEntity

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
