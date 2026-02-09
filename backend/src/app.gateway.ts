import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
    credentials: true,
  },
  namespace: '/ws',
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(AppGateway.name);
  private connectedClients = new Map<string, string>(); // socketId -> userId

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    this.connectedClients.set(client.id, data.userId);
    client.join(`user:${data.userId}`);
    return { event: 'authenticated', data: { success: true } };
  }

  @SubscribeMessage('joinVideoRoom')
  handleJoinVideo(@ConnectedSocket() client: Socket, @MessageBody() data: { videoId: string }) {
    client.join(`video:${data.videoId}`);
    return { event: 'joined', data: { videoId: data.videoId } };
  }

  // Emit methods for other services to use
  sendNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  sendVideoUpdate(videoId: string, update: any) {
    this.server.to(`video:${videoId}`).emit('videoUpdate', update);
  }

  sendEncodingProgress(userId: string, data: { videoId: string; progress: number; status: string }) {
    this.server.to(`user:${userId}`).emit('encodingProgress', data);
  }

  broadcastAnnouncement(message: any) {
    this.server.emit('announcement', message);
  }

  getOnlineUsersCount(): number {
    return this.connectedClients.size;
  }
}
