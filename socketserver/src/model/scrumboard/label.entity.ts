import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { ScrumboardBoardEntity } from '.'
@Unique(['title', 'board'])
@Entity({ name: 'scrumboard_label' })
export class ScrumboardLabelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  title: string

  @Column()
  boardId: string
  @ManyToOne(() => ScrumboardBoardEntity)
  board: ScrumboardBoardEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
