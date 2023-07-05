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
// import { CHANNEL_STATUS } from '.'
// import { CHANNEL } from '../../../config/constant'
import { OrganizationEntity, UserEntity } from '../organization'
import { FacebookChannelEntity } from './facebook.entity'
import { LineChannelEntity } from './line.entity'
import { InstagramChannelEntity } from './instagram.entity'

export enum CHANNEL {
  LINE = 'line',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
}

export enum CHANNEL_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPEND = 'suspend',
}

@Entity({ name: 'channel' })
export class ChannelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  channel: CHANNEL

  @OneToOne(() => InstagramChannelEntity, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  instagram: InstagramChannelEntity

  @OneToOne(() => FacebookChannelEntity, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  facebook: FacebookChannelEntity

  @OneToOne(() => LineChannelEntity, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  line: LineChannelEntity

  @Column({ nullable: false, default: CHANNEL_STATUS.ACTIVE })
  status: CHANNEL_STATUS

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

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: UserEntity
}
