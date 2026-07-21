import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get()
  async getInbox(@Request() req) {
    return this.messagesService.getInbox(req.user.id);
  }

  @Get('sent')
  async getSent(@Request() req) {
    return this.messagesService.getSent(req.user.id);
  }

  @Post()
  async send(@Request() req, @Body() body: { recipient_id: number; content: string }) {
    return this.messagesService.send(req.user.id, body.recipient_id, body.content);
  }

  @Post('broadcast')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async broadcast(
    @Request() req,
    @Body() body: { recipient_role: string; content: string },
  ) {
    return this.messagesService.broadcast(req.user.id, body.recipient_role, body.content);
  }

  @Patch(':id/read')
  async markRead(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.messagesService.markRead(id, req.user.id);
  }
}
