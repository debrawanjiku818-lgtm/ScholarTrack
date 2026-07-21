import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';
import { Public } from '../auth/public.decorator';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('test')
  @Public()
  async testEmail(@Body() body: { email: string; name: string }) {
    const result = await this.emailService.sendVerificationEmail(
      body.email,
      body.name,
      'test-token-12345'
    );
    return { 
      success: result,
      message: result ? '✅ Email sent successfully! Check your inbox.' : '❌ Failed to send email.'
    };
  }
}
