import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Send, 
  Paperclip, 
  Calendar, 
  Check, 
  CheckCheck, 
  Clock,
  Users,
  MessageCircle
} from 'lucide-react';
import { wsService, ChatMessage, MeetingRequest } from '../../services/websocket';
import { apiClient } from '../../services/api';
import { toast } from 'sonner';

interface ChatRoom {
  id: number;
  participants: Array<{
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    user_type: string;
  }>;
  last_message?: {
    id: number;
    content: string;
    sender: string;
    message_type: string;
    created_at: string;
  };
  unread_count: number;
}

interface ChatProps {
  currentUser: any;
}

export function Chat({ currentUser }: ChatProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchChatRooms();
    connectWebSocket();
    
    return () => {
      wsService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = async () => {
    try {
      await wsService.connect();
      setIsConnected(true);
      
      // Set up message handlers
      wsService.on('message', handleNewMessage);
      wsService.on('typing', handleTypingIndicator);
      wsService.on('meeting_request', handleMeetingRequest);
      wsService.on('meeting_response', handleMeetingResponse);
      
      toast.success('Connected to chat');
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      toast.error('Failed to connect to chat');
    }
  };

  const fetchChatRooms = async () => {
    try {
      const data = await apiClient.get<ChatRoom[]>('/chat/rooms/');
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
    }
  };

  const fetchMessages = async (roomId: number) => {
    try {
      const data = await apiClient.get<ChatMessage[]>(`/chat/rooms/${roomId}/messages/`);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleNewMessage = (data: any) => {
    const message = data.data || data.message;
    if (message && (!selectedRoom || message.room_id === selectedRoom.id)) {
      setMessages(prev => [...prev, message]);
    }
  };

  const handleTypingIndicator = (data: any) => {
    const { user_id, is_typing } = data.data || data;
    if (user_id !== currentUser.id) {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (is_typing) {
          newSet.add(user_id);
        } else {
          newSet.delete(user_id);
        }
        return newSet;
      });
    }
  };

  const handleMeetingRequest = (data: any) => {
    toast.info('New meeting request received!');
    fetchChatRooms(); // Refresh rooms to show new message
  };

  const handleMeetingResponse = (data: any) => {
    toast.success('Meeting request updated!');
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !isConnected) return;

    try {
      const otherUser = selectedRoom.participants.find(p => p.id !== currentUser.id);
      if (otherUser) {
        wsService.sendMessage(otherUser.id, newMessage.trim());
        setNewMessage('');
        stopTyping();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const sendMeetingRequest = () => {
    if (!selectedRoom) return;

    const datetime = new Date();
    datetime.setDate(datetime.getDate() + 1); // Tomorrow
    datetime.setHours(14, 0, 0, 0); // 2 PM

    const otherUser = selectedRoom.participants.find(p => p.id !== currentUser.id);
    if (otherUser) {
      wsService.sendMeetingRequest(
        otherUser.id,
        datetime.toISOString(),
        'Meeting Request'
      );
      toast.success('Meeting request sent!');
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && selectedRoom) {
      const otherUser = selectedRoom.participants.find(p => p.id !== currentUser.id);
      if (otherUser) {
        wsService.sendTypingIndicator(otherUser.id, true);
        setIsTyping(true);
      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedRoom) {
        const otherUser = selectedRoom.participants.find(p => p.id !== currentUser.id);
        if (otherUser) {
          wsService.sendTypingIndicator(otherUser.id, false);
          setIsTyping(false);
        }
      }
    }, 1000);
  };

  const stopTyping = () => {
    if (isTyping && selectedRoom) {
      const otherUser = selectedRoom.participants.find(p => p.id !== currentUser.id);
      if (otherUser) {
        wsService.sendTypingIndicator(otherUser.id, false);
        setIsTyping(false);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherUser = (room: ChatRoom) => {
    return room.participants.find(p => p.id !== currentUser.id);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageIcon = (messageType: string) => {
    switch (messageType) {
      case 'meeting_request':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'meeting_approved':
        return <CheckCheck className="h-4 w-4 text-green-500" />;
      case 'meeting_rejected':
        return <Clock className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Chat Rooms Sidebar */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Messages
          </h3>
        </div>
        
        <ScrollArea className="h-[calc(100%-80px)]">
          <div className="p-2">
            {rooms.map((room) => {
              const otherUser = getOtherUser(room);
              return (
                <div
                  key={room.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedRoom?.id === room.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {otherUser?.first_name?.[0]}{otherUser?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {otherUser?.first_name} {otherUser?.last_name}
                        </p>
                        {room.unread_count > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {room.unread_count}
                          </Badge>
                        )}
                      </div>
                      {room.last_message && (
                        <p className="text-xs text-gray-500 truncate">
                          {room.last_message.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {getOtherUser(selectedRoom)?.first_name?.[0]}
                      {getOtherUser(selectedRoom)?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {getOtherUser(selectedRoom)?.first_name} {getOtherUser(selectedRoom)?.last_name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {getOtherUser(selectedRoom)?.user_type}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={sendMeetingRequest}
                  className="flex items-center space-x-1"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Request Meeting</span>
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === currentUser.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === currentUser.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {getMessageIcon(message.message_type)}
                        <span className="text-xs opacity-75">
                          {formatMessageTime(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      {message.meeting_data && (
                        <div className="mt-2 p-2 bg-white bg-opacity-20 rounded">
                          <p className="text-xs font-medium">
                            {message.meeting_data.topic}
                          </p>
                          <p className="text-xs">
                            {new Date(message.meeting_data.datetime).toLocaleString()}
                          </p>
                          <Badge
                            variant={message.meeting_data.status === 'approved' ? 'default' : 'secondary'}
                            className="text-xs mt-1"
                          >
                            {message.meeting_data.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {typingUsers.size > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 px-4 py-2 rounded-lg">
                      <p className="text-sm text-gray-600">
                        {Array.from(typingUsers).map(userId => {
                          const user = selectedRoom.participants.find(p => p.id === userId);
                          return user?.first_name;
                        }).join(', ')} typing...
                      </p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-2">
                <Input
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                />
                <Button size="sm" variant="outline">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
