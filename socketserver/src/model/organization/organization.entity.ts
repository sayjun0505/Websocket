import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import {
  ActivationEntity,
  OrganizationUserEntity,
  PackageEntity,
  UserEntity,
} from '.'
import { ChannelEntity } from '../channel'

export enum ORGANIZATION_STATUS {
  ACTIVE = 'active',
  WARNING = 'warning',
  INACTIVE = 'inactive',
  SUSPEND = 'suspend',
}

@Entity({ name: 'organization' })
export class OrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index({ unique: true })
  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  @JoinColumn()
  activationId: string

  @ManyToOne(() => ActivationEntity, { nullable: true }) // null value is a Free package
  activation: ActivationEntity

  @OneToMany(
    () => OrganizationUserEntity,
    (organizationUser) => organizationUser.organization,
  )
  organizationUser!: OrganizationUserEntity[]

  @Column({ nullable: false, default: ORGANIZATION_STATUS.ACTIVE })
  status: ORGANIZATION_STATUS

  @Column({ name: 'woocommerce_url', nullable: true })
  woocommerceUrl: string
  @Column({ name: 'woocommerce_consumer_key', nullable: true })
  woocommerceConsumerKey: string
  @Column({ name: 'woocommerce_consumer_secret', nullable: true })
  woocommerceConsumerSecret: string

  @Column({ name: 'motopress_url', nullable: true })
  motopressUrl: string
  @Column({ name: 'motopress_consumer_key', nullable: true })
  motopressConsumerKey: string
  @Column({ name: 'motopress_consumer_secret', nullable: true })
  motopressConsumerSecret: string

  @OneToOne(() => ChannelEntity)
  @JoinColumn()
  channel: ChannelEntity

  @Column({ name: 'line_notify', nullable: true })
  lineNotify: string

  @Column({ nullable: false, default: false, name: 'is_delete' })
  isDelete: boolean

  @Column({ nullable: true, default: 'all' })
  sunday: string
  @Column({ nullable: true, default: 'all' })
  monday: string
  @Column({ nullable: true, default: 'all' })
  tuesday: string
  @Column({ nullable: true, default: 'all' })
  wednesday: string
  @Column({ nullable: true, default: 'all' })
  thursday: string
  @Column({ nullable: true, default: 'all' })
  friday: string
  @Column({ nullable: true, default: 'all' })
  saturday: string
  @Column({ nullable: true, default: '' })
  workingHoursMessage: string

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

//

// import { OrganizationUser } from './organizationUser.entity'
// import { LineChannel } from '../chat/channelSetting/line.entity'
// import { FacebookChannel } from '../chat/channelSetting/facebook.entity'

// @Column({ nullable: true })
// package: string
// @ManyToOne(() => Package)
// @JoinColumn()
// package: Package

// @ManyToMany(() => User.UserEntity, (user) => user.organization)
// @JoinTable({ name: 'organization_user' })
// user: User.UserEntity[]

// @OneToMany(
//   () => OrganizationUser,
//   (organizationUser) => organizationUser.organization,
// )
// organizationUser: OrganizationUser[]

// @OneToMany(() => LineChannel, (line) => line.organization)
// line: LineChannel[]
// @OneToMany(() => FacebookChannel, (facebook) => facebook.organization)
// facebook: FacebookChannel[]
