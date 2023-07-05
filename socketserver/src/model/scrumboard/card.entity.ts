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
  Unique,
  UpdateDateColumn,
} from 'typeorm'

import {
  // BoardLabelEntity
  // CardActivityEntity,
  // CardAttachmentEntity,
  // ChecklistEntity,
  // CommentEntity,
  ScrumboardBoardEntity,
  ScrumboardCardActivityEntity,
  ScrumboardCardAttachmentEntity,
  ScrumboardCardChecklistEntity,
  ScrumboardCardLabelEntity,
  // ScrumboardCardLabelEntity,
  ScrumboardCardMemberEntity,
  ScrumboardLabelEntity,
  ScrumboardListEntity,
} from '.'

import { ChatEntity } from '../../model/chat'

import { OrganizationEntity, UserEntity } from '../organization'

@Entity({ name: 'scrumboard_card' })
export class ScrumboardCardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  boardId: string
  @ManyToOne(() => ScrumboardBoardEntity)
  board: ScrumboardBoardEntity

  @Column({ nullable: true })
  listId: string
  @ManyToOne(() => ScrumboardListEntity, (list) => list.cards)
  list: ScrumboardListEntity

  @Column({ nullable: true })
  chatId: string
  @OneToOne(() => ChatEntity)
  chat: ChatEntity

  @Column({ nullable: false, default: '' })
  title: string

  @Column({ nullable: false, default: '' })
  description: string

  @OneToMany(() => ScrumboardCardLabelEntity, (cardLabel) => cardLabel.card)
  cardLabels: ScrumboardCardLabelEntity[]

  @Column({ nullable: true })
  dueDate: number

  @OneToMany(() => ScrumboardCardMemberEntity, (cardMember) => cardMember.card, {nullable: true})
  cardMembers: ScrumboardCardMemberEntity[]

  @OneToMany(
    () => ScrumboardCardAttachmentEntity,
    (attachments) => attachments.card,
  )
  attachments: ScrumboardCardAttachmentEntity[]

  @Column({ nullable: false, default: false, name: 'is_subscribed' })
  subscribed: boolean

  @OneToMany(
    () => ScrumboardCardChecklistEntity,
    (checklists) => checklists.card,
  )
  checklists: ScrumboardCardChecklistEntity[]

  @OneToMany(() => ScrumboardCardActivityEntity, (activity) => activity.card)
  activities: ScrumboardCardActivityEntity[]

  @Column({ nullable: true })
  attachmentCoverId: string
  @ManyToOne(() => ScrumboardCardAttachmentEntity)
  attachmentCover: ScrumboardCardAttachmentEntity

  @Column({ nullable: false, default: false, name: 'is_delete' })
  isDelete: boolean

  @Column({ nullable: false, default: 0, name: 'order_index' })
  orderIndex: number

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn()
  organization: OrganizationEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  createdBy: UserEntity

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: UserEntity

  ////////////////////////////////////////
  // idMembers: string[] = []
  // idLabels: string[] = []
  // @Column({ type: 'int', nullable: false, default: 0 })
  // checkItems: number
  // @Column({ type: 'int', nullable: false, default: 0 })
  // checkItemsChecked: number
}
