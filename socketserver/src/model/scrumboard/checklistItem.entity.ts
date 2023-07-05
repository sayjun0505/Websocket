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

// import { CHANNEL, CHECKLISTITEM_DIRECTION } from '../../config/constant'
import { ScrumboardCardChecklistEntity } from '.'
import { OrganizationEntity, UserEntity } from '../organization'

@Entity({ name: 'scrumboard_card_checklist_item' })
export class ScrumboardCardChecklistItemEntity {
  @PrimaryColumn()
  id: string

  @Column({ nullable: false })
  name: string

  @Column({ nullable: false, default: false, name: 'is_checked' })
  checked: boolean

  @Column({ nullable: false, default: false, name: 'is_delete' })
  isDelete: boolean

  @Column()
  @JoinColumn()
  checklistId: string
  @ManyToOne(
    () => ScrumboardCardChecklistEntity,
    (checklist) => checklist.checkItems,
  )
  checklist: ScrumboardCardChecklistEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  // @ManyToOne(() => UserEntity)
  // @JoinColumn({ name: 'created_by' })
  // createdBy: UserEntity

  // @ManyToOne(() => UserEntity)
  // @JoinColumn({ name: 'updated_by' })
  // updatedBy: UserEntity
}
