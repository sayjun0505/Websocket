import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { ScrumboardCardEntity } from '.'
import { OrganizationEntity, UserEntity } from '../organization'

@Entity({ name: 'scrumboard_card_activity' })
export class ScrumboardCardActivityEntity {
  @PrimaryColumn()
  id: string

  @Column({ nullable: false })
  message: string

  @Column({ nullable: false, default: 'comment' })
  type: string

  @Column({ nullable: true })
  time: number

  @Column()
  @JoinColumn()
  memberId: string
  @ManyToOne(() => UserEntity)
  member: UserEntity

  @Column()
  @JoinColumn()
  cardId: string
  @ManyToOne(() => ScrumboardCardEntity, (card) => card.activities)
  card: ScrumboardCardEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
