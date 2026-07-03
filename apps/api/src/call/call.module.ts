import { Module } from '@nestjs/common';
import { CallGateway } from './call.gateway';
import { CallService } from './call.service';
import { CallController } from './call.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [CallGateway, CallService],
  controllers: [CallController],
  exports: [CallService],
})
export class CallModule {}
