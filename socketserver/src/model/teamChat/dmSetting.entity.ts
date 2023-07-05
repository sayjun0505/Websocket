import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm'
  import { OrganizationEntity, UserEntity } from '../organization'
  
  @Entity({ name: 'teamchat_dm_setting' })
  export class TeamChatDmSettingEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string
  
    @Column()
    readAt: Date
  
    @Column()
    @JoinColumn()
    userId: string
    @ManyToOne(() => UserEntity)
    user: UserEntity

    @Column()    
    @JoinColumn()
    receiveUserId: string
    @ManyToOne(() => UserEntity)
    receiveUser: UserEntity
  
    @Column()
    @JoinColumn()
    organizationId: string
    @ManyToOne(() => OrganizationEntity)
    organization: OrganizationEntity
  }
  