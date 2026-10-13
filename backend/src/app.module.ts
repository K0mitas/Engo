import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [UsersModule, AuthModule, ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT')),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
