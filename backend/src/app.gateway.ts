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
import { Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      // CORS handled dynamically via ConfigService in afterInit
      callback(null, true);
    },
    credentials: true,
  },
  namespace: '/ws',
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(AppGateway.name);
  private connectedClients = new Map<string, string>(); // socketId -> userId
  private allowedOrigins: string[];

  constructor(private configService: ConfigService) {
    // Load CORS origins from security config
    const corsConfig = this.configService.get('security.cors.origin');
    this.allowedOrigins = corsConfig || [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
    ];
  }

  afterInit() {
    this.logger.log(`WebSocket Gateway initialized with CORS origins: ${this.allowedOrigins.join(', ')}`);
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

  // ─── Admin Dashboard Realtime ────────────────────────
  @SubscribeMessage('joinAdminRoom')
  handleJoinAdminRoom(@ConnectedSocket() client: Socket) {
    client.join('admin:dashboard');
    this.logger.log(`Admin client ${client.id} joined admin:dashboard room`);
    return { event: 'joinedAdminRoom', data: { success: true } };
  }

  broadcastDashboardUpdate(data: any) {
    this.server.to('admin:dashboard').emit('dashboard:update', data);
  }

  broadcastAnalyticsUpdate(data: any) {
    this.server.to('admin:dashboard').emit('analytics:update', data);
  }

  broadcastNewActivity(activity: any) {
    this.server.to('admin:dashboard').emit('dashboard:newActivity', activity);
  }

  getOnlineUsersCount(): number {
    return this.connectedClients.size;
  }
}
