import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import {
  ScrumboardBoardMemberEntity,
  ScrumboardCardEntity,
  ScrumboardLabelEntity,
  ScrumboardListEntity,
} from '.'
import { ChatEntity } from '../chat'
import { OrganizationEntity, UserEntity } from '../organization'
import { TodoLabelEntity } from '../todos'

@Entity({ name: 'scrumboard_board' })
export class ScrumboardBoardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  title: string

  @Column({ nullable: true, default: '' })
  description: string

  @OneToMany(() => ScrumboardListEntity, (list) => list.board)
  lists: ScrumboardListEntity[]

  @OneToMany(
    () => ScrumboardBoardMemberEntity,
    (boardMember) => boardMember.board,
  )
  @JoinColumn()
  boardMembers: ScrumboardBoardMemberEntity[]

  @Column('simple-json')
  settings: { subscribed: boolean; cardCoverImages: boolean }

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

  ////////

  // @OneToMany(() => CardEntity, (card) => card.board)
  // cards: CardEntity[]

  // chats: ChatEntity[] = []
  // @ManyToMany(() => BoardLabelEntity, (label) => label.board)
  // labels: TodoLabelEntity[] = []
}
