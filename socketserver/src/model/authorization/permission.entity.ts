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
import { ResourceEntity, RoleEntity } from '.'

@Unique(['role', 'resource'])
@Entity({ name: 'permission' })
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => RoleEntity, (role) => role.permission)
  role: RoleEntity

  @ManyToOne(() => ResourceEntity, (resource) => resource.permission)
  resource: ResourceEntity

  @Column({ nullable: false, default: false, name: 'create' })
  create: boolean

  @Column({ nullable: false, default: false, name: 'update' })
  update: boolean

  @Column({ nullable: false, default: false, name: 'read' })
  read: boolean

  @Column({ nullable: false, default: false, name: 'delete' })
  delete: boolean
}
