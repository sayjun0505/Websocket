import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { OrganizationEntity, UserEntity } from '../organization'
import { ReplyEntity } from './reply.entity'

export enum RESPONSE_TYPE {
  TEXT = 'text',
  IMAGE = 'image',
  BUTTONS = 'buttons',
  CAROUSEL = 'carousel',
  CONFIRM = 'confirm',
  FLEX = 'flex',
}

export enum RESPONSE_CHANNEL {
  DEFAULT = 'default',
  LINE = 'line',
  FACEBOOK = 'facebook',
}

// @Unique(['reply', 'order'])
@Entity({ name: 'reply_response' })
export class ReplyResponseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  data: string

  @Column({ nullable: false, default: RESPONSE_CHANNEL.DEFAULT })
  channel: RESPONSE_CHANNEL

  @Column({ nullable: false })
  type: RESPONSE_TYPE

  @Column({ nullable: false, default: 1 })
  order: number

  @ManyToOne(() => ReplyEntity, { nullable: true })
  @JoinColumn()
  reply: ReplyEntity

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
