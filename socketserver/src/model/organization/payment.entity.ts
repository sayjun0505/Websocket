import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { ActivationEntity } from './activation.entity'

@Entity({ name: 'payment' })
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid') // Use uuid as activation code
  id: string

  @Column({ nullable: true })
  @JoinColumn()
  activationId: string

  @ManyToOne(() => ActivationEntity, { nullable: true })
  activation: ActivationEntity

  @Column({ length: 250, nullable: true })
  gbpReferenceNo: string

  @Column({ length: 2, nullable: true })
  resultCode: string

  @Column({ type: 'decimal', nullable: true })
  amount: number

  @Column({ length: 1, nullable: true })
  paymentType: string

  @Column({ length: 16, nullable: true })
  cardNo: string

  @Column({ name: 'payment_at' })
  paymentAt: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
