import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export enum ADDRESS_TYPE {
  DEFAULT = 'default',
  SHIPPING = 'shipping',
}

import { UserEntity } from '../organization'
import { CustomerEntity } from './customer.entity'
@Entity({ name: 'address' })
export class AddressEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  name: string
  @Column({ nullable: true })
  tel: string
  @Column()
  address1: string
  @Column({ nullable: true })
  address2: string
  @Column()
  subDistrict: string
  @Column()
  district: string
  @Column()
  province: string
  @Column()
  zipCode: number

  @Column({ default: ADDRESS_TYPE.DEFAULT, nullable: false })
  type: ADDRESS_TYPE

  @ManyToOne(() => CustomerEntity)
  @JoinColumn()
  customer: CustomerEntity

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
