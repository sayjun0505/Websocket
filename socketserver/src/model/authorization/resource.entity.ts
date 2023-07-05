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

@Entity({ name: 'resource' })
export class ResourceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: false })
  name: string

  @OneToMany(() => PermissionEntity, (permission) => permission.resource)
  permission!: PermissionEntity[]
}
