// Real-time Chat Application using Actor Model
// Demonstrates: Actor Model, WebSocket, Real-time messaging, State management

import { HTTP, WebSocket, Database } from 'stdlib';

// Data models
class User {
  @id id: number;
  @field username: string;
  @field email: string;
  @field isOnline: boolean;
  @timestamp lastSeen: DateTime;
}

class ChatRoom {
  @id id: number;
  @field name: string;
  @field description: string;
  @field isPrivate: boolean;
  @field ownerId: number;
  @timestamp createdAt: DateTime;
  @relation messages: Message[];
  @relation members: User[];
}

class Message {
  @id id: number;
  @field content: string;
  @field userId: number;
  @field roomId: number;
  @field messageType: string; // "text", "image", "file", "system"
  @timestamp sentAt: DateTime;
  @field editedAt?: DateTime;
  @field replyToId?: number;
}

// Actor for managing chat room state
const ChatRoomActor = runtime.createActor(
  async (message: any, state: any) => {
    match message.type {
      'JOIN_ROOM' => {
        const { userId, roomId } = message.payload;
        
        // Add user to room members
        if (!state.rooms[roomId]) {
          state.rooms[roomId] = {
            members: new Set(),
            messages: [],
            typing: new Set()
          };
        }
        
        state.rooms[roomId].members.add(userId);
        
        // Broadcast user joined
        return {
          type: 'USER_JOINED',
          roomId,
          userId,
          timestamp: new Date().toISOString()
        };
      },
      
      'LEAVE_ROOM' => {
        const { userId, roomId } = message.payload;
        
        if (state.rooms[roomId]) {
          state.rooms[roomId].members.delete(userId);
          state.rooms[roomId].typing.delete(userId);
        }
        
        return {
          type: 'USER_LEFT',
          roomId,
          userId,
          timestamp: new Date().toISOString()
        };
      },
      
      'SEND_MESSAGE' => {
        const { userId, roomId, content, messageType = 'text' } = message.payload;
        
        // Save message to database
        const newMessage = new Message({
          content,
          userId,
          roomId,
          messageType,
          sentAt: new DateTime()
        });
        
        await Database.save(newMessage);
        
        // Add to room state
        if (state.rooms[roomId]) {
          state.rooms[roomId].messages.push(newMessage);
          // Keep only last 50 messages in memory
          if (state.rooms[roomId].messages.length > 50) {
            state.rooms[roomId].messages = state.rooms[roomId].messages.slice(-50);
          }
        }
        
        return {
          type: 'MESSAGE_SENT',
          message: newMessage,
          roomId
        };
      },
      
      'START_TYPING' => {
        const { userId, roomId } = message.payload;
        
        if (state.rooms[roomId]) {
          state.rooms[roomId].typing.add(userId);
        }
        
        return {
          type: 'USER_TYPING',
          roomId,
          userId,
          timestamp: new Date().toISOString()
        };
      },
      
      'STOP_TYPING' => {
        const { userId, roomId } = message.payload;
        
        if (state.rooms[roomId]) {
          state.rooms[roomId].typing.delete(userId);
        }
        
        return {
          type: 'USER_STOPPED_TYPING',
          roomId,
          userId,
          timestamp: new Date().toISOString()
        };
      },
      
      'GET_ROOM_STATE' => {
        const { roomId } = message.payload;
        return state.rooms[roomId] || null;
      },
      
      _ => state
    }
  },
  { rooms: {} } // Initial state
);

// Actor for managing user presence
const UserPresenceActor = runtime.createActor(
  async (message: any, state: any) => {
    match message.type {
      'USER_ONLINE' => {
        const { userId } = message.payload;
        state.onlineUsers.add(userId);
        
        // Update database
        await Database.query(User)
          .where(u => u.id === userId)
          .update({ isOnline: true, lastSeen: new DateTime() });
        
        return {
          type: 'PRESENCE_UPDATED',
          userId,
          isOnline: true
        };
      },
      
      'USER_OFFLINE' => {
        const { userId } = message.payload;
        state.onlineUsers.delete(userId);
        
        // Update database
        await Database.query(User)
          .where(u => u.id === userId)
          .update({ isOnline: false, lastSeen: new DateTime() });
        
        return {
          type: 'PRESENCE_UPDATED',
          userId,
          isOnline: false
        };
      },
      
      'GET_ONLINE_USERS' => {
        return Array.from(state.onlineUsers);
      },
      
      _ => state
    }
  },
  { onlineUsers: new Set() } // Initial state
);

// WebSocket connection manager
class ConnectionManager {
  constructor() {
    this.connections = new Map(); // userId -> WebSocket connection
    this.userRooms = new Map(); // userId -> Set of roomIds
  }
  
  addConnection(userId: number, ws: WebSocket) {
    this.connections.set(userId, ws);
    this.userRooms.set(userId, new Set());
    
    // Notify presence actor
    UserPresenceActor.send({
      id: `presence-${Date.now()}`,
      type: 'USER_ONLINE',
      payload: { userId },
      timestamp: Date.now()
    });
  }
  
  removeConnection(userId: number) {
    const connection = this.connections.get(userId);
    if (connection) {
      connection.close(); // Resource cleanup
    }
    this.connections.delete(userId);
    const rooms = this.userRooms.get(userId) || new Set();
    
    // Leave all rooms
    for (const roomId of rooms) {
      ChatRoomActor.send({
        id: `leave-${Date.now()}`,
        type: 'LEAVE_ROOM',
        payload: { userId, roomId },
        timestamp: Date.now()
      });
    }
    
    this.userRooms.delete(userId);
    
    // Notify presence actor
    UserPresenceActor.send({
      id: `presence-${Date.now()}`,
      type: 'USER_OFFLINE',
      payload: { userId },
      timestamp: Date.now()
    });
  }
  
  joinRoom(userId: number, roomId: number) {
    const rooms = this.userRooms.get(userId) || new Set();
    rooms.add(roomId);
    this.userRooms.set(userId, rooms);
    
    ChatRoomActor.send({
      id: `join-${Date.now()}`,
      type: 'JOIN_ROOM',
      payload: { userId, roomId },
      timestamp: Date.now()
    });
  }
  
  broadcastToRoom(roomId: number, message: any, excludeUserId?: number) {
    const usersInRoom = Array.from(this.userRooms.entries())
      .filter(([userId, rooms]) => rooms.has(roomId) && userId !== excludeUserId)
      .map(([userId]) => userId);
    
    for (const userId of usersInRoom) {
      const connection = this.connections.get(userId);
      if (connection && connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify(message));
      }
    }
  }
  
  sendToUser(userId: number, message: any) {
    const connection = this.connections.get(userId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(message));
    }
  }
}

const connectionManager = new ConnectionManager();

// HTTP Server setup
const app = new HTTP.Server();

// REST API endpoints
app.get("/rooms", async (req, res) => {
  try {
    const rooms = await Database.query(ChatRoom)
      .where(r => !r.isPrivate)
      .orderBy("createdAt", "desc");
    
    res.json({ rooms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/rooms", async (req, res) => {
  try {
    const { name, description, isPrivate = false } = req.body;
    const ownerId = req.user?.id; // Assume authentication middleware
    
    const room = new ChatRoom({
      name,
      description,
      isPrivate,
      ownerId,
      createdAt: new DateTime()
    });
    
    await Database.save(room);
    
    res.status(201).json({ room });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/rooms/:id/messages", async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    const { page = 1, limit = 50 } = req.query;
    
    const messages = await Database.query(Message)
      .where(m => m.roomId === roomId)
      .include('user')
      .orderBy("sentAt", "desc")
      .skip((page - 1) * limit)
      .take(limit);
    
    res.json({ messages: messages.reverse() }); // Return in chronological order
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket server setup
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws: WebSocket, req) => {
  let userId: number | null = null;
  
  ws.on('message', async (data: string) => {
    try {
      const message = JSON.parse(data);
      
      match message.type {
        'AUTH' => {
          // Authenticate user (simplified)
          userId = message.userId;
          connectionManager.addConnection(userId, ws);
          
          ws.send(JSON.stringify({
            type: 'AUTH_SUCCESS',
            message: 'Connected successfully'
          }));
        },
        
        'JOIN_ROOM' => {
          if (userId) {
            const { roomId } = message;
            connectionManager.joinRoom(userId, roomId);
            
            // Get room state
            const roomState = await ChatRoomActor.ask({
              id: `get-state-${Date.now()}`,
              type: 'GET_ROOM_STATE',
              payload: { roomId },
              timestamp: Date.now()
            });
            
            ws.send(JSON.stringify({
              type: 'ROOM_JOINED',
              roomId,
              state: roomState
            }));
            
            // Broadcast to other users in room
            connectionManager.broadcastToRoom(roomId, {
              type: 'USER_JOINED_ROOM',
              userId,
              roomId,
              timestamp: new Date().toISOString()
            }, userId);
          }
        },
        
        'SEND_MESSAGE' => {
          if (userId) {
            const { roomId, content, messageType } = message;
            
            const result = await ChatRoomActor.ask({
              id: `msg-${Date.now()}`,
              type: 'SEND_MESSAGE',
              payload: { userId, roomId, content, messageType },
              timestamp: Date.now()
            });
            
            // Broadcast message to all users in room
            connectionManager.broadcastToRoom(roomId, {
              type: 'NEW_MESSAGE',
              message: result.message
            });
          }
        },
        
        'START_TYPING' => {
          if (userId) {
            const { roomId } = message;
            
            await ChatRoomActor.send({
              id: `typing-${Date.now()}`,
              type: 'START_TYPING',
              payload: { userId, roomId },
              timestamp: Date.now()
            });
            
            connectionManager.broadcastToRoom(roomId, {
              type: 'USER_TYPING',
              userId,
              roomId
            }, userId);
          }
        },
        
        'STOP_TYPING' => {
          if (userId) {
            const { roomId } = message;
            
            await ChatRoomActor.send({
              id: `stop-typing-${Date.now()}`,
              type: 'STOP_TYPING',
              payload: { userId, roomId },
              timestamp: Date.now()
            });
            
            connectionManager.broadcastToRoom(roomId, {
              type: 'USER_STOPPED_TYPING',
              userId,
              roomId
            }, userId);
          }
        },
        
        _ => {
          ws.send(JSON.stringify({
            type: 'ERROR',
            message: 'Unknown message type'
          }));
        }
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: error.message
      }));
    }
  });
  
  ws.on('close', () => {
    if (userId) {
      connectionManager.removeConnection(userId);
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Auto-cleanup: Stop typing after timeout
setInterval(() => {
  // This would be handled by the typing timeout in a real implementation
  // For demo purposes, we'll just log that cleanup is running
  console.log('Running cleanup tasks...');
}, 30000); // 30 seconds

console.log('Chat server running on:');
console.log('- HTTP API: http://localhost:3000');
console.log('- WebSocket: ws://localhost:8080');

// Start HTTP server
const PORT = process.env.PORT || 3000;
app.listen(PORT);

export { ConnectionManager, ChatRoomActor, UserPresenceActor };