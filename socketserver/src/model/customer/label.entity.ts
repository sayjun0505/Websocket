import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { OrganizationEntity, UserEntity } from '../organization'
import { CustomerEntity } from './customer.entity'

@Unique('label_organization', ['label', 'organization'])
@Entity({ name: 'customer_label' })
export class CustomerLabelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  label: string

  @Column({ default: false, name: 'is_delete' })
  isDelete: boolean

  @ManyToMany(() => CustomerEntity, (customer) => customer.customerLabel)
  customer: CustomerEntity[]

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
