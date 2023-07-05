// import {
//   Column,
//   CreateDateColumn,
//   Entity,
//   JoinColumn,
//   JoinTable,
//   ManyToMany,
//   ManyToOne,
//   OneToMany,
//   OneToOne,
//   PrimaryGeneratedColumn,
//   Unique,
//   UpdateDateColumn,
// } from 'typeorm'

// import { OrganizationEntity, OrganizationUserEntity, UserEntity } from '.'

// // @Unique(['organization', 'name'])
// @Entity({ name: 'credit_card' })
// export class CreditCardEntity {
//   @PrimaryGeneratedColumn('uuid')
//   id: string

//   @Column()
//   name: string
//   @Column()
//   number: string
//   @Column()
//   expirationMonth: string
//   @Column()
//   expirationYear: string
//   @Column()
//   token: string

//   @Column({ length: 15, nullable: true }) // recurring reference
//   recurringNo: string

//   @OneToOne(() => UserEntity)
//   @JoinColumn({ name: 'created_by' })
//   createdBy: UserEntity

//   @CreateDateColumn({ name: 'created_at' })
//   createdAt: Date
// }
