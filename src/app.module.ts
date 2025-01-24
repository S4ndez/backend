import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type:'postgres',
      host:'localhost',
      port:5432,
      username:'admin',
      password:'admin',
      database:'admin',
      autoLoadEntities:true,
      synchronize:true
    })
    ,UserModule],

})
export class AppModule {}
