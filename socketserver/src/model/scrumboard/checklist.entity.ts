import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { ScrumboardCardChecklistItemEntity, ScrumboardCardEntity } from '.'
@Entity({ name: 'scrumboard_card_checklist' })
export class ScrumboardCardChecklistEntity {
  @PrimaryColumn()
  id: string

  @Column({ nullable: false })
  name: string

  @Column()
  cardId: string
  @ManyToOne(() => ScrumboardCardEntity, (card) => card.checklists)
  card: ScrumboardCardEntity

  @OneToMany(
    () => ScrumboardCardChecklistItemEntity,
    (checklistItem) => checklistItem.checklist,
  )
  checkItems: ScrumboardCardChecklistItemEntity[]

  @Column({ nullable: false, default: false, name: 'is_delete' })
  isDelete: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
