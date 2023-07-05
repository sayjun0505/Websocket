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

import { ScrumboardBoardEntity, ScrumboardListEntity } from '.'
import { CustomerLabelEntity } from '../customer'
import { UserEntity } from '../organization'

@Unique(['label', 'list'])
@Entity({ name: 'scrumboard_list_customer_label' })
export class ScrumboardListCustomerLabelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @JoinColumn()
  labelId: string
  @ManyToOne(() => CustomerLabelEntity)
  label: CustomerLabelEntity

  @Column()
  listId: string
  @ManyToOne(() => ScrumboardListEntity, (list) => list.listCustomerLabel)
  list: ScrumboardListEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
