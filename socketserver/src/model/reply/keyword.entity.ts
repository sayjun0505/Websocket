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
import { ReplyEntity } from '.'
import { OrganizationEntity, UserEntity } from '../organization'

// @Unique(['keyword', 'organization'])
@Entity({ name: 'reply_keyword' })
export class ReplyKeywordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  keyword: string

  // @ManyToOne(() => ReplyEntity, { nullable: true, onDelete: 'CASCADE' })
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
