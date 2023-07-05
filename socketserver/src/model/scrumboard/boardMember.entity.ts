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

import { ScrumboardBoardEntity } from '.'
import { UserEntity } from '../organization'

@Unique(['board', 'member'])
@Entity({ name: 'scrumboard_board_member' })
export class ScrumboardBoardMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @JoinColumn()
  memberId: string
  @ManyToOne(() => UserEntity)
  member: UserEntity

  @Column()
  boardId: string
  @ManyToOne(() => ScrumboardBoardEntity, (board) => board.boardMembers)
  board: ScrumboardBoardEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
