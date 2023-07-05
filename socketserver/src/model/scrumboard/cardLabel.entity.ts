import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import {
  ScrumboardBoardEntity,
  ScrumboardCardEntity,
  ScrumboardLabelEntity,
} from './'

@Unique(['label', 'card'])
@Entity({ name: 'scrumboard_card_label' })
export class ScrumboardCardLabelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @JoinColumn()
  boardId: string
  @ManyToOne(() => ScrumboardBoardEntity)
  board: ScrumboardBoardEntity

  @Column()
  @JoinColumn()
  cardId: string
  @ManyToOne(() => ScrumboardCardEntity)
  card: ScrumboardCardEntity

  @Column()
  @JoinColumn()
  labelId: string
  @ManyToOne(() => ScrumboardLabelEntity)
  label: ScrumboardLabelEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
