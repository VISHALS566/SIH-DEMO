// WebSocket service for real-time chat and notifications
export interface ChatMessage {
  id: number;
  sender: number;
  recipient: number;
  content: string;
  message_type: 'message' | 'meeting_request' | 'meeting_approved' | 'meeting_rejected';
  attachments?: Array<{
    id: number;
    file_name: string;
    file_url: string;
    file_type: string;
  }>;
  created_at: string;
  read_at?: string;
  meeting_data?: {
    datetime: string;
    topic: string;
    status: 'pending' | 'approved' | 'rejected';
  };
}

export interface MeetingRequest {
  id: number;
  requester: number;
  recipient: number;
  datetime: string;
  topic: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface TypingIndicator {
  user_id: number;
  user_name: string;
  is_typing: boolean;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private isConnected = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          reject(new Error('No access token available'));
          return;
        }

        const wsUrl = `ws://localhost:8000/ws/chat/?token=${token}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.isConnected = false;
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(() => {
          // Reconnect failed, will try again
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private handleMessage(data: any): void {
    const handlers = this.messageHandlers.get(data.type) || [];
    handlers.forEach(handler => handler(data));
  }

  on(event: string, handler: (data: any) => void): void {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: (data: any) => void): void {
    const handlers = this.messageHandlers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  sendMessage(toUserId: number, content: string, attachments?: File[]): void {
    if (!this.isConnected || !this.ws) {
      throw new Error('WebSocket not connected');
    }

    const message = {
      type: 'message',
      to_user: toUserId,
      content,
      attachments: attachments?.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
    };

    this.ws.send(JSON.stringify(message));
  }

  sendMeetingRequest(toUserId: number, datetime: string, topic: string): void {
    if (!this.isConnected || !this.ws) {
      throw new Error('WebSocket not connected');
    }

    const message = {
      type: 'meeting_request',
      to_user: toUserId,
      datetime,
      topic,
    };

    this.ws.send(JSON.stringify(message));
  }

  sendTypingIndicator(toUserId: number, isTyping: boolean): void {
    if (!this.isConnected || !this.ws) {
      return;
    }

    const message = {
      type: 'typing',
      to_user: toUserId,
      is_typing: isTyping,
    };

    this.ws.send(JSON.stringify(message));
  }

  approveMeeting(meetingId: number): void {
    if (!this.isConnected || !this.ws) {
      throw new Error('WebSocket not connected');
    }

    const message = {
      type: 'meeting_approval',
      meeting_id: meetingId,
      status: 'approved',
    };

    this.ws.send(JSON.stringify(message));
  }

  rejectMeeting(meetingId: number): void {
    if (!this.isConnected || !this.ws) {
      throw new Error('WebSocket not connected');
    }

    const message = {
      type: 'meeting_approval',
      meeting_id: meetingId,
      status: 'rejected',
    };

    this.ws.send(JSON.stringify(message));
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.messageHandlers.clear();
  }

  isConnectedToWebSocket(): boolean {
    return this.isConnected;
  }
}

export const wsService = new WebSocketService();
