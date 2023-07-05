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

import { OrganizationEntity, TeamEntity, UserEntity } from '.'

export enum ORGANIZATION_USER_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PADDING = 'padding',
}

export enum USER_ROLE {
  PRIMARY = 'primary',
  ADMIN = 'admin',
  MANAGER = 'manager',
  AGENT = 'agent',
}
@Unique(['organization', 'user'])
@Entity({ name: 'organization_user' })
export class OrganizationUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @JoinColumn()
  userId: string
  @ManyToOne(() => UserEntity, (user) => user.organizationUser)
  user: UserEntity

  @Column()
  @JoinColumn()
  organizationId: string
  @ManyToOne(
    () => OrganizationEntity,
    (organization) => organization.organizationUser,
  )
  organization: OrganizationEntity

  @Column({ nullable: true })
  @JoinColumn()
  teamId: string
  @ManyToOne(() => TeamEntity, { nullable: true })
  @JoinColumn()
  team: TeamEntity

  @Column({ nullable: false, default: ORGANIZATION_USER_STATUS.ACTIVE })
  status: ORGANIZATION_USER_STATUS

  @Column({ nullable: false, default: USER_ROLE.AGENT })
  role: USER_ROLE

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

  //   @OneToOne(() => Organization)
  //   @JoinColumn()
  //   organization: Organization

  //   @OneToOne(() => User)
  //   @JoinColumn()
  //   user: User

  // @Column()
  // isActive: boolean;

  // @ManyToOne(() => User, (user) => user.organizationUser, { primary: true })
  // user: User
  // @ManyToOne(
  //   () => Organization,
  //   (organization) => organization.organizationUser,
  //   { primary: true },
  // )
  // organization: Organization

  // @CreateDateColumn({ name: 'created_at' }) 'created_at': Date
  // @UpdateDateColumn({ name: 'updated_at' }) 'updated_at': Date

  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'created_by' })
  // createdBy: User

  // @ManyToOne(() => User)
  // @JoinColumn({ name: 'updated_by' })
  // updatedBy: User
}

// export default {
//   OrganizationUserEntity,
//   ROLE,
// }
