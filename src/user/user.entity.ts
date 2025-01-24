import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id: number;
    @Column({nullable:false})
    name: string;
    @Column({unique:true, nullable:false})
    email: string;
    @Column({nullable:false})
    password: string;
    @Column({nullable:false, default:'user'})
    role: string;
}