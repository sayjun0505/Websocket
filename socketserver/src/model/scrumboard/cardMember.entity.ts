import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'

import { ScrumboardBoardEntity, ScrumboardCardEntity } from '.'
import { UserEntity } from '../organization'

// @Unique(['card', 'member'])
@Entity({ name: 'scrumboard_card_member' })
export class ScrumboardCardMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @JoinColumn()
  memberId: string
  @ManyToOne(() => UserEntity)
  member: UserEntity

  @Column()
  @JoinColumn()
  cardId: string
  @ManyToOne(() => ScrumboardCardEntity, (card) => card.cardMembers)
  card: ScrumboardCardEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
