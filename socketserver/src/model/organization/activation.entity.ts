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

import { OrganizationEntity, PackageEntity, PaymentEntity, UserEntity } from '.'

export enum ACTIVATION_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  INVITE = 'invite',
  WAITING_PAYMENT = 'waitingPayment', // waiting for payment
  WAITING_CONFIRM = 'waitingConfirm', // waiting for confirm
}

export enum PAYMENT_TYPE {
  PROMPT_PAY = 'PromptPay',
  CREDIT_CARD = 'CreditCard',
}
export enum PAYMENT_OPTION {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  HALF_YEARLY = 'halfYearly',
  YEARLY = 'yearly',
}

@Entity({ name: 'activation' })
export class ActivationEntity {
  @PrimaryGeneratedColumn('uuid') // Use uuid as activation code
  id: string

  @Column({ nullable: true })
  description: string

  @Column()
  @JoinColumn()
  packageId: string

  @Column({ nullable: true }) // invite code
  inviteCode: string

  @Column({ length: 15, nullable: true }) // payment reference
  referenceNo: string

  @Column({ nullable: true }) // stripe sub id
  subId: string

  @Column({ nullable: true }) // stripe customer id
  customerId: string

  @Column({ nullable: false, default: ACTIVATION_STATUS.WAITING_PAYMENT })
  status: ACTIVATION_STATUS

  // @Column({ nullable: true, default: PAYMENT_TYPE.PROMPT_PAY })
  // paymentType: PAYMENT_TYPE

  // @Column({ nullable: true, default: PAYMENT_OPTION.YEARLY })
  // paymentOption: PAYMENT_OPTION

  @OneToMany(() => PaymentEntity, (payment) => payment.activation)
  payment: PaymentEntity[]

  @OneToMany(
    () => OrganizationEntity,
    (organization) => organization.activation,
  )
  organization: OrganizationEntity[]

  @ManyToOne(() => PackageEntity, { nullable: false })
  package: PackageEntity

  @Column({ nullable: true })
  expiration: Date

  @Column({ nullable: false, default: false, name: 'is_delete' })
  isDelete: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  createdBy: UserEntity
}
