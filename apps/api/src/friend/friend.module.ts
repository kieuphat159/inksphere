import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendResolver } from './friend.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FriendResolver, FriendService],
})
export class FriendModule {}
