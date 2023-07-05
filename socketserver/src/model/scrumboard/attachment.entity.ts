import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { ScrumboardCardEntity } from '.'
import { OrganizationEntity, UserEntity } from '../organization'

@Entity({ name: 'scrumboard_card_attachment' })
export class ScrumboardCardAttachmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  name: string

  @Column({ nullable: false })
  src: string

  @Column({ nullable: false, default: 'image' })
  type: string

  @Column({ nullable: true })
  time: number

  @Column()
  @JoinColumn()
  cardId: string
  @ManyToOne(() => ScrumboardCardEntity, (card) => card.attachments)
  card: ScrumboardCardEntity

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn()
  organization: OrganizationEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  createdBy: UserEntity

  @Column({ nullable: false, default: false, name: 'is_delete' })
  isDelete: boolean
}
