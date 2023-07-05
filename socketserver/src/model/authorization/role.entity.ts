import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { PermissionEntity } from '.'

export enum ROLE_LEVEL {
  LEVEL1 = 1, // Admin
  LEVEL2 = 2, // Manager
  LEVEL3 = 3, // Agent
}

@Entity({ name: 'role' })
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  name: string

  @Column({ nullable: false, default: ROLE_LEVEL.LEVEL3 })
  level: ROLE_LEVEL

  @OneToMany(() => PermissionEntity, (permission) => permission.role)
  permission!: PermissionEntity[]
}
