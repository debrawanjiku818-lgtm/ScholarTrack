import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey || '');
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <h1 style="color: #818cf8; font-size: 28px;">🎓 ScholarTrack</h1>
          <p style="color: #94a3b8; font-size: 14px;">Empowering Education Through Technology</p>
        </div>
        
        <div style="padding: 30px 0;">
          <h2 style="color: #f8fafc; font-size: 22px;">Verify Your Email Address</h2>
          <p style="color: #94a3b8; line-height: 1.6; font-size: 16px;">
            Hello <strong style="color: #f8fafc;">${name}</strong>,
          </p>
          <p style="color: #94a3b8; line-height: 1.6; font-size: 16px;">
            Thank you for registering with ScholarTrack! Please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 35px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            Or copy and paste this link into your browser:
          </p>
          <p style="color: #818cf8; font-size: 12px; word-break: break-all; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; text-align: center;">
            ${verifyUrl}
          </p>
          <p style="color: #64748b; font-size: 13px; margin-top: 20px; text-align: center;">
            ⏰ This link will expire in 24 hours.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px 0; border-top: 1px solid rgba(255,255,255,0.05); color: #64748b; font-size: 12px;">
          <p>&copy; 2024 ScholarTrack. All rights reserved.</p>
          <p style="margin-top: 5px;">
            If you didn't create an account, please ignore this email.
          </p>
        </div>
      </div>
    `;

    try {
      const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') || 'noreply@resend.dev';
      
      await this.resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: 'Verify Your ScholarTrack Account',
        html,
      });

      this.logger.log(`✅ Verification email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send email: ${(error as Error).message}`);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <h1 style="color: #818cf8; font-size: 28px;">🎓 ScholarTrack</h1>
        </div>
        
        <div style="padding: 30px 0;">
          <h2 style="color: #f8fafc; font-size: 22px;">Reset Your Password</h2>
          <p style="color: #94a3b8; line-height: 1.6; font-size: 16px;">
            Hello <strong style="color: #f8fafc;">${name}</strong>,
          </p>
          <p style="color: #94a3b8; line-height: 1.6; font-size: 16px;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 35px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            Or copy and paste this link into your browser:
          </p>
          <p style="color: #818cf8; font-size: 12px; word-break: break-all; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; text-align: center;">
            ${resetUrl}
          </p>
          <p style="color: #64748b; font-size: 13px; margin-top: 20px; text-align: center;">
            ⏰ This link will expire in 1 hour.
          </p>
          <p style="color: #64748b; font-size: 13px; text-align: center;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px 0; border-top: 1px solid rgba(255,255,255,0.05); color: #64748b; font-size: 12px;">
          <p>&copy; 2024 ScholarTrack. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') || 'noreply@resend.dev';
      
      await this.resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: 'Reset Your ScholarTrack Password',
        html,
      });

      this.logger.log(`✅ Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send email: ${(error as Error).message}`);
      return false;
    }
  }

  async sendEnrollmentConfirmation(email: string, name: string, courseName: string): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const dashboardUrl = `${frontendUrl}/dashboard`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <h1 style="color: #818cf8; font-size: 28px;">🎓 ScholarTrack</h1>
        </div>
        
        <div style="padding: 30px 0;">
          <h2 style="color: #f8fafc; font-size: 22px;">🎉 Enrollment Confirmed!</h2>
          <p style="color: #94a3b8; line-height: 1.6; font-size: 16px;">
            Hello <strong style="color: #f8fafc;">${name}</strong>,
          </p>
          <p style="color: #94a3b8; line-height: 1.6; font-size: 16px;">
            You have successfully enrolled in:
          </p>
          
          <div style="text-align: center; padding: 20px; background: rgba(99,102,241,0.1); border-radius: 12px; border: 1px solid rgba(99,102,241,0.1); margin: 20px 0;">
            <h3 style="color: #f8fafc; font-size: 20px;">📚 ${courseName}</h3>
          </div>
          
          <p style="color: #94a3b8; line-height: 1.6; font-size: 16px;">
            You can start learning right now by visiting your dashboard.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 35px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px 0; border-top: 1px solid rgba(255,255,255,0.05); color: #64748b; font-size: 12px;">
          <p>&copy; 2024 ScholarTrack. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') || 'noreply@resend.dev';
      
      await this.resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: `🎉 Enrolled in ${courseName}`,
        html,
      });

      this.logger.log(`✅ Enrollment confirmation sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send email: ${(error as Error).message}`);
      return false;
    }
  }
}
