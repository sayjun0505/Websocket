import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

// import { CHANNEL, CUSTOMER_STATUS } from '../../config/constant'
import { ChannelEntity } from '../channel'
import { OrganizationEntity, UserEntity } from '../organization'
// import { Address } from './address.entity'
import { ChatEntity } from '../chat'
import {
  AddressEntity,
  CustomerLabelEntity,
  CustomerPointLogEntity,
  CustomerRewardLogEntity,
} from './'
@Unique('Customer unique', ['uid', 'channel'])
@Entity({ name: 'customer' })
export class CustomerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  uid: string
  @Column({ nullable: true })
  firstname: string
  @Column({ nullable: true })
  lastname: string
  @Column({ nullable: false })
  display: string
  @Column({ nullable: true })
  picture: string
  @Column({ nullable: true })
  tel: string
  @Column({ nullable: true })
  email: string
  @Column({ nullable: true })
  remarks: string

  @Column()
  channelId: string
  @ManyToOne(() => ChannelEntity)
  @JoinColumn()
  channel: ChannelEntity

  @ManyToMany(
    () => CustomerLabelEntity,
    (customerLabel) => customerLabel.customer,
    { cascade: true, onDelete: 'CASCADE' },
  )
  @JoinTable({ name: 'customer_customer_label' })
  customerLabel: CustomerLabelEntity[]

  @OneToMany(() => ChatEntity, (chat) => chat.customer)
  chat: ChatEntity[]

  @OneToMany(() => AddressEntity, (address) => address.customer)
  address: AddressEntity[]

  @OneToMany(() => CustomerPointLogEntity, (pointLog) => pointLog.customer)
  pointLog: CustomerPointLogEntity[]

  @OneToMany(() => CustomerRewardLogEntity, (rewardLog) => rewardLog.customer)
  rewardLog: CustomerRewardLogEntity[]

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

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  createdBy: UserEntity

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: UserEntity
}
