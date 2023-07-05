import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import {
  ScrumboardBoardEntity,
  ScrumboardCardEntity,
  ScrumboardListChatEntity,
  ScrumboardListCustomerLabelEntity,
} from '.'
import { ChatEntity } from '../chat'
import { CustomerLabelEntity } from '../customer'
import { OrganizationEntity, UserEntity } from '../organization'

@Entity({ name: 'scrumboard_list' })
export class ScrumboardListEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  title: string

  @Column()
  boardId: string
  @ManyToOne(() => ScrumboardBoardEntity, (board) => board.lists)
  board: ScrumboardBoardEntity

  @OneToMany(() => ScrumboardCardEntity, (card) => card.list)
  cards: ScrumboardCardEntity[]

  @OneToMany(() => ScrumboardListChatEntity, (listChat) => listChat.list)
  @JoinColumn()
  listChat: ScrumboardListChatEntity[]

  @Column({ nullable: true, default: '', name: 'chat_type' })
  chatType: string

  // @Column({ nullable: true, default: '', name: 'chat_labels' })
  // chatLabels: string
  @OneToMany(
    () => ScrumboardListCustomerLabelEntity,
    (listCustomerLabel) => listCustomerLabel.list,
    { cascade: true, onDelete: 'CASCADE' },
  )
  listCustomerLabel: ScrumboardListCustomerLabelEntity[]

  @Column({ nullable: false, default: 0, name: 'order_index' })
  orderIndex: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @Column({ nullable: false, default: false, name: 'is_delete' })
  isDelete: boolean

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn()
  organization: OrganizationEntity

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  createdBy: UserEntity

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: UserEntity
}
