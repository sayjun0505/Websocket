import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { ChatEntity } from '../chat'
import {
  ScrumboardBoardEntity,
  ScrumboardCardEntity,
  ScrumboardLabelEntity,
  ScrumboardListEntity,
} from './'

@Entity({ name: 'scrumboard_list_chat' })
export class ScrumboardListChatEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string
  // @PrimaryColumn()
  // id: string

  @Column()
  boardId: string
  @ManyToOne(() => ScrumboardBoardEntity)
  board: ScrumboardBoardEntity

  @Column()
  listId: string
  @ManyToOne(() => ScrumboardListEntity, (list) => list.listChat)
  list: ScrumboardListEntity

  @Column()
  chatId: string
  @ManyToOne(() => ChatEntity)
  chat: ChatEntity

  @Column({ nullable: false, default: 0, name: 'order_index' })
  orderIndex: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
