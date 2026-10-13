import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
  
  export type UserPlan = 'free' | 'pro' | 'business';
  
  @Entity('users')
  export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    password: string;
  
    @Column({ type: 'varchar' })
    name: string;
  
    @Column({ type: 'varchar', default: 'free' })
    plan: UserPlan;
  
    @Column({ type: 'timestamp', nullable: true })
    subscriptionUntil: Date | null;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }