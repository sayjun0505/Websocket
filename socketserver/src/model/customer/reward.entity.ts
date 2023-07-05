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
import { OrganizationEntity, UserEntity } from '../organization'

export enum REWARD_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

// @Index('index_item_sequence', ['firstName', 'lastName'], { unique: true })
// @Unique('Customer unique', ['uid', 'channel'])
@Entity({ name: 'reward' })
export class RewardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  name: string

  @Column({ nullable: false, default: 0 })
  point: number

  @Column({ nullable: false, default: 0 })
  stock: number

  @Column({ nullable: true })
  imageURL: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: false, default: REWARD_STATUS.ACTIVE })
  status: REWARD_STATUS

  @Column({ nullable: false, default: false, name: 'is_delete' })
  isDelete: boolean

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
