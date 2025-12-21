import { Module } from '@nestjs/common';
import { PasswordRecoveryService } from './password-recovery.service';
import { PasswordRecoveryController } from './password-recovery.controller';
import { MailModule } from '../../libs/mail/mail.module';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [MailModule, UserModule],
  controllers: [PasswordRecoveryController],
  providers: [PasswordRecoveryService],
})
export class PasswordRecoveryModule {}
