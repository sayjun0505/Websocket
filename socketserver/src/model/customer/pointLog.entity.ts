import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { OrganizationEntity, UserEntity } from '../organization'
import { CustomerEntity } from '.'
@Entity({ name: 'customer_point_log' })
export class CustomerPointLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false, default: 0 })
  point: number

  @Column({ nullable: true })
  description: string

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
