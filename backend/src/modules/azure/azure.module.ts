import { Module } from '@nestjs/common';
import AuthModule from '../auth/auth.module';
import { CommunicationModule } from '../communication/communication.module';
import { StorageModule } from '../storage/storage.module';
import UsersModule from '../users/users.module';
import { authAzureService, checkUserUseCase, registerOrLoginUseCase } from './azure.providers';
import AzureController from './controller/azure.controller';
import { JwtRegister } from 'src/infrastructure/config/jwt.register';

@Module({
	imports: [UsersModule, AuthModule, CommunicationModule, StorageModule, JwtRegister],
	controllers: [AzureController],
	providers: [authAzureService, checkUserUseCase, registerOrLoginUseCase]
})
export default class AzureModule {}
