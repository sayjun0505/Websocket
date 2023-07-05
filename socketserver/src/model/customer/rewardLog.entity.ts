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

import { OrganizationEntity, UserEntity } from '../organization'
import { CustomerEntity, RewardEntity } from '.'
// @Index('index_item_sequence', ['firstName', 'lastName'], { unique: true })
// @Unique('Customer unique', ['uid', 'channel'])
@Entity({ name: 'customer_reward_log' })
export class CustomerRewardLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false, default: 0 })
  point: number

  @Column({ nullable: true })
  description: string

  @ManyToOne(() => RewardEntity)
  @JoinColumn()
  reward: RewardEntity

  @ManyToOne(() => CustomerEntity)
  @JoinColumn()
  customer: CustomerEntity

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn()
  organization: OrganizationEntity
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  createdBy: UserEntity
}
