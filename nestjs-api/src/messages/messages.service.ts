import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  private toApiShape(m: any) {
    return {
      id: m.id,
      sender_id: m.senderId,
      sender_name: m.sender?.fullName || m.sender?.username,
      sender_role: m.sender?.role,
      recipient_id: m.recipientId,
      recipient_name: m.recipient?.fullName || m.recipient?.username,
      content: m.content,
      is_read: m.isRead,
      created_at: m.createdAt,
      is_broadcast: m.isBroadcast || false,
      recipient_role: m.recipientRole || null,
    };
  }

  async getInbox(userId: number) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { recipientId: userId },
          { isBroadcast: true },
        ],
      },
      include: { sender: true, recipient: true },
      orderBy: { createdAt: 'desc' },
    });
    return messages.map((m) => this.toApiShape(m));
  }

  async getSent(userId: number) {
    const messages = await this.prisma.message.findMany({
      where: { senderId: userId },
      include: { sender: true, recipient: true },
      orderBy: { createdAt: 'desc' },
    });
    return messages.map((m) => this.toApiShape(m));
  }

  async send(senderId: number, recipientId: number, content: string) {
    const recipient = await this.prisma.user.findUnique({ where: { id: recipientId } });
    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }
    const message = await this.prisma.message.create({
      data: { senderId, recipientId, content },
      include: { sender: true, recipient: true },
    });
    return this.toApiShape(message);
  }

  async broadcast(senderId: number, recipientRole: string, content: string) {
    const message = await this.prisma.message.create({
      data: {
        senderId,
        content,
        isBroadcast: true,
        recipientRole: recipientRole,
        recipientId: null,
      },
      include: { sender: true },
    });
    return this.toApiShape(message);
  }

  async markRead(id: number, userId: number) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.recipientId !== userId && !message.isBroadcast) {
      throw new ForbiddenException('You can only mark your own messages as read');
    }
    return this.prisma.message.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
