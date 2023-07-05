import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { ActivationEntity, UserEntity } from '.'

@Entity({ name: 'package' })
export class PackageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true, nullable: false })
  name: string

  @Column({ name: 'stripe_product_id', nullable: true })
  stripeProductId: string

  // @Column({ default: 0, nullable:true })
  // yearlyPrice: number

  // @Column({ default: 0, nullable:true })
  // quarterlyPrice: number

  // @Column({ default: 0, nullable:true })
  // halfYearlyPrice: number

  // @Column({ default: 0, nullable:true })
  // monthlyPrice: number

  @Column({ default: true })
  public: boolean

  @Column({ default: false })
  isFree: boolean
  @Column({ name: 'file_limit', nullable: false, default: 0, type: 'decimal' })
  fileLimit: number
  @Column({
    name: 'storage_limit',
    nullable: false,
    default: 0,
    type: 'decimal',
  })
  storageLimit: number
  @Column({ name: 'organization_limit', nullable: false, default: 1 })
  organizationLimit: number
  @Column({ name: 'user_limit', nullable: false, default: 1 })
  userLimit: number
  @Column({ name: 'message_limit', nullable: false, default: 1 }) // message limit per month
  messageLimit: number
  @Column({ name: 'channel_limit', nullable: false, default: 1 })
  channelLimit: number
  @Column({
    name: 'channel_type',
    nullable: false,
    type: 'text',
    default: [],
    array: true,
  })
  channelType: string[]

  @OneToMany(() => ActivationEntity, (activation) => activation.package)
  activation: ActivationEntity[]

  @Column({ nullable: false, default: false, name: 'is_delete' })
  isDelete: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
