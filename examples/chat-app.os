// Modern Real-time Chat Application using Actor Model
// Demonstrates: Actor Model, WebSocket, Real-time messaging, State management, Type Safety

use { HTTP, WebSocket, Database, DateTime, Console, Runtime } from 'stdlib';

// Type definitions
type MessageType = "text" | "image" | "file" | "system" | "emoji";

type ChatMessage = {
  type :: string,
  payload :: any,
  timestamp :: number,
  id :: string
};

type RoomState = {
  members :: Set<number>,
  messages :: Message[],
  typing :: Set<number>
};

type ConnectionInfo = {
  userId :: number,
  ws :: WebSocket,
  rooms :: Set<number>,
  lastActivity :: DateTime
};

// Data models with modern syntax
object User {
  @id id :: number;
  @field username :: string;
  @field email :: string;
  @field isOnline :: boolean;
  @field avatarUrl :: string;
  @timestamp lastSeen :: DateTime;
  @timestamp createdAt :: DateTime;
  
  constructor(data :: any) {
    this.username = data.username;
    this.email = data.email;
    this.isOnline = false;
    this.avatarUrl = data.avatarUrl || "";
    this.lastSeen = DateTime.now();
    this.createdAt = DateTime.now();
  }
  
  def updatePresence :: (isOnline :: boolean) -> void = (isOnline) => {
    this.isOnline = isOnline;
    this.lastSeen = DateTime.now();
  };
}

object ChatRoom {
  @id id :: number;
  @field name :: string;
  @field description :: string;
  @field isPrivate :: boolean;
  @field maxMembers :: number;
  @field ownerId :: number;
  @timestamp createdAt :: DateTime;
  @relation messages :: Message[];
  @relation members :: User[];
  
  constructor(data :: any) {
    this.name = data.name;
    this.description = data.description;
    this.isPrivate = data.isPrivate || false;
    this.maxMembers = data.maxMembers || 100;
    this.ownerId = data.ownerId;
    this.createdAt = DateTime.now();
  }
  
  def canJoin :: (userId :: number) -> boolean = (userId) => {
    return !this.isPrivate || this.ownerId === userId || this.members.length < this.maxMembers;
  };
}

object Message {
  @id id :: number;
  @field content :: string;
  @field userId :: number;
  @field roomId :: number;
  @field messageType :: MessageType;
  @field metadata :: any;
  @timestamp sentAt :: DateTime;
  @timestamp editedAt :: DateTime;
  @field replyToId :: number;
  @field reactions :: any[];
  
  constructor(data :: any) {
    this.content = data.content;
    this.userId = data.userId;
    this.roomId = data.roomId;
    this.messageType = data.messageType || "text";
    this.metadata = data.metadata || {};
    this.sentAt = DateTime.now();
    this.replyToId = data.replyToId;
    this.reactions = [];
  }
  
  def edit :: (newContent :: string) -> void = (newContent) => {
    this.content = newContent;
    this.editedAt = DateTime.now();
  };
  
  def addReaction :: (userId :: number, emoji :: string) -> void = (userId, emoji) => {
    def existingReaction = this.reactions.find((r) => r.userId === userId && r.emoji === emoji);
    match existingReaction {
      case undefined => this.reactions.push({ userId, emoji, timestamp: DateTime.now() })
      case _ => {} // Already exists, do nothing
    }
  };
}

// Actor for managing chat room state with enhanced functionality
def ChatRoomActor :: any = Runtime.createActor(
  async (message :: ChatMessage, state :: any) => {
    match message.type {
      case "JOIN_ROOM" => {
        def { userId, roomId } = message.payload;
        
        // Initialize room if doesn't exist
        match state.rooms[roomId] {
          case undefined => {
            state.rooms[roomId] = {
              members: new Set(),
              messages: [],
              typing: new Set(),
              metadata: { created: DateTime.now() }
            };
          }
          case _ => {}
        }
        
        def room :: RoomState = state.rooms[roomId];
        room.members.add(userId);
        
        // Get recent messages for new user
        def recentMessages :: Message[] = await Database.query<Message>()
          .where((m) => m.roomId === roomId)
          .orderBy("sentAt", "desc")
          .limit(20)
          .execute();
        
        return {
          type: 'USER_JOINED',
          roomId,
          userId,
          recentMessages: recentMessages.reverse(),
          memberCount: room.members.size,
          timestamp: DateTime.now().toISOString()
        };
      }
      
      case "LEAVE_ROOM" => {
        def { userId, roomId } = message.payload;
        
        match state.rooms[roomId] {
          case undefined => {}
          case room => {
            room.members.delete(userId);
            room.typing.delete(userId);
            
            // Clean up empty rooms
            match room.members.size {
              case 0 => delete state.rooms[roomId]
              case _ => {}
            }
          }
        }
        
        return {
          type: 'USER_LEFT',
          roomId,
          userId,
          memberCount: state.rooms[roomId]?.members.size || 0,
          timestamp: DateTime.now().toISOString()
        };
      }
      
      case "SEND_MESSAGE" => {
        def { userId, roomId, content, messageType, replyToId, metadata } = message.payload;
        
        // Validate message content
        match content.trim().length {
          case 0 => return { type: 'ERROR', message: 'Message cannot be empty' }
          case x if x > 2000 => return { type: 'ERROR', message: 'Message too long' }
          case _ => {
            def newMessage :: Message = new Message({
              content: content.trim(),
              userId,
              roomId,
              messageType: messageType || "text",
              replyToId,
              metadata: metadata || {}
            });
            
            def savedMessage :: Message = await Database.save(newMessage);
            
            // Add to room state and manage memory
            match state.rooms[roomId] {
              case undefined => {}
              case room => {
                room.messages.push(savedMessage);
                // Keep only last 50 messages in memory for performance
                match room.messages.length > 50 {
                  case true => room.messages = room.messages.slice(-50)
                  case false => {}
                }
              }
            }
            
            return {
              type: 'MESSAGE_SENT',
              message: savedMessage,
              roomId,
              memberCount: state.rooms[roomId]?.members.size || 0
            };
          }
        }
      }
      
      case "EDIT_MESSAGE" => {
        def { userId, messageId, newContent } = message.payload;
        
        def message :: Message | null = await Database.findById<Message>(messageId);
        
        match message {
          case null => return { type: 'ERROR', message: 'Message not found' }
          case msg if msg.userId !== userId => return { type: 'ERROR', message: 'Unauthorized' }
          case msg => {
            msg.edit(newContent);
            def savedMessage :: Message = await Database.save(msg);
            
            return {
              type: 'MESSAGE_EDITED',
              message: savedMessage,
              roomId: msg.roomId
            };
          }
        }
      }
      
      case "START_TYPING" => {
        def { userId, roomId } = message.payload;
        
        match state.rooms[roomId] {
          case undefined => {}
          case room => room.typing.add(userId)
        }
        
        return {
          type: 'USER_TYPING',
          roomId,
          userId,
          typingUsers: Array.from(state.rooms[roomId]?.typing || []),
          timestamp: DateTime.now().toISOString()
        };
      }
      
      case "STOP_TYPING" => {
        def { userId, roomId } = message.payload;
        
        match state.rooms[roomId] {
          case undefined => {}
          case room => room.typing.delete(userId)
        }
        
        return {
          type: 'USER_STOPPED_TYPING',
          roomId,
          userId,
          typingUsers: Array.from(state.rooms[roomId]?.typing || []),
          timestamp: DateTime.now().toISOString()
        };
      }
      
      case "ADD_REACTION" => {
        def { userId, messageId, emoji } = message.payload;
        
        def message :: Message | null = await Database.findById<Message>(messageId);
        
        match message {
          case null => return { type: 'ERROR', message: 'Message not found' }
          case msg => {
            msg.addReaction(userId, emoji);
            def savedMessage :: Message = await Database.save(msg);
            
            return {
              type: 'REACTION_ADDED',
              message: savedMessage,
              roomId: msg.roomId,
              userId,
              emoji
            };
          }
        }
      }
      
      case "GET_ROOM_STATE" => {
        def { roomId } = message.payload;
        return state.rooms[roomId] || null;
      }
      
      case _ => state
    }
  },
  { rooms: {} } // Initial state
);

// Enhanced User Presence Actor with better state management
def UserPresenceActor :: any = Runtime.createActor(
  async (message :: ChatMessage, state :: any) => {
    match message.type {
      case "USER_ONLINE" => {
        def { userId, metadata } = message.payload;
        state.onlineUsers.set(userId, {
          lastSeen: DateTime.now(),
          metadata: metadata || {}
        });
        
        // Update database
        await Database.query<User>()
          .where((u) => u.id === userId)
          .update({ isOnline: true, lastSeen: DateTime.now() });
        
        return {
          type: 'PRESENCE_UPDATED',
          userId,
          isOnline: true,
          onlineCount: state.onlineUsers.size
        };
      }
      
      case "USER_OFFLINE" => {
        def { userId } = message.payload;
        state.onlineUsers.delete(userId);
        
        // Update database
        await Database.query<User>()
          .where((u) => u.id === userId)
          .update({ isOnline: false, lastSeen: DateTime.now() });
        
        return {
          type: 'PRESENCE_UPDATED',
          userId,
          isOnline: false,
          onlineCount: state.onlineUsers.size
        };
      }
      
      case "HEARTBEAT" => {
        def { userId } = message.payload;
        match state.onlineUsers.get(userId) {
          case undefined => {}
          case user => {
            user.lastSeen = DateTime.now();
            state.onlineUsers.set(userId, user);
          }
        }
        return state;
      }
      
      case "GET_ONLINE_USERS" => {
        return Array.from(state.onlineUsers.keys());
      }
      
      case "CLEANUP_STALE_USERS" => {
        def cutoffTime :: DateTime = DateTime.now().subtract(5, 'minutes');
        def staleUsers :: number[] = [];
        
        state.onlineUsers.forEach((user, userId) => {
          match user.lastSeen.isBefore(cutoffTime) {
            case true => staleUsers.push(userId)
            case false => {}
          }
        });
        
        def cleanupPromises :: Promise<void>[] = staleUsers |> map(async (userId) => {
          state.onlineUsers.delete(userId);
          await Database.query<User>()
            .where((u) => u.id === userId)
            .update({ isOnline: false });
        });
        
        await Promise.all(cleanupPromises);
        
        return {
          type: 'STALE_USERS_CLEANED',
          cleanedCount: staleUsers.length,
          onlineCount: state.onlineUsers.size
        };
      }
      
      case _ => state
    }
  },
  { onlineUsers: new Map() } // Initial state with Map for better performance
);

// Enhanced WebSocket connection manager with type safety
object ConnectionManager {
  def connections :: Map<number, ConnectionInfo>;
  def userRooms :: Map<number, Set<number>>;
  def rateLimiter :: Map<number, number[]>;
  
  constructor() {
    this.connections = new Map();
    this.userRooms = new Map();
    this.rateLimiter = new Map();
  }
  
  def addConnection :: (userId :: number, ws :: WebSocket) -> Either<string, boolean> = (userId, ws) => {
    match this.connections.has(userId) {
      case true => left("User already connected")
      case false => {
        def connectionInfo :: ConnectionInfo = {
          userId,
          ws,
          rooms: new Set(),
          lastActivity: DateTime.now()
        };
        
        this.connections.set(userId, connectionInfo);
        this.userRooms.set(userId, new Set());
        
        // Notify presence actor
        UserPresenceActor.send({
          id: `presence-${DateTime.now().getTime()}`,
          type: 'USER_ONLINE',
          payload: { userId, metadata: { connectionTime: DateTime.now() } },
          timestamp: DateTime.now().getTime()
        });
        
        return right(true);
      }
    }
  };
  
  def removeConnection :: (userId :: number) -> void = (userId) => {
    def connectionInfo :: ConnectionInfo | undefined = this.connections.get(userId);
    
    match connectionInfo {
      case undefined => {}
      case info => {
        match info.ws.readyState === WebSocket.OPEN {
          case true => info.ws.close()
          case false => {}
        }
        
        // Leave all rooms
        def rooms :: Set<number> = this.userRooms.get(userId) || new Set();
        def leavePromises :: Promise<any>[] = Array.from(rooms) |> map(async (roomId) => {
          await ChatRoomActor.send({
            id: `leave-${DateTime.now().getTime()}`,
            type: 'LEAVE_ROOM',
            payload: { userId, roomId },
            timestamp: DateTime.now().getTime()
          });
        });
        
        Promise.all(leavePromises);
        
        this.connections.delete(userId);
        this.userRooms.delete(userId);
        this.rateLimiter.delete(userId);
        
        // Notify presence actor
        UserPresenceActor.send({
          id: `presence-${DateTime.now().getTime()}`,
          type: 'USER_OFFLINE',
          payload: { userId },
          timestamp: DateTime.now().getTime()
        });
      }
    }
  };
  
  def joinRoom :: (userId :: number, roomId :: number) -> Promise<Either<string, boolean>> = async (userId, roomId) => {
    // Check if room exists and user can join
    def room :: ChatRoom | null = await Database.findById<ChatRoom>(roomId);
    
    match room {
      case null => return left("Room not found")
      case room => {
        match room.canJoin(userId) {
          case false => return left("Cannot join this room")
          case true => {
            def rooms :: Set<number> = this.userRooms.get(userId) || new Set();
            rooms.add(roomId);
            this.userRooms.set(userId, rooms);
            
            ChatRoomActor.send({
              id: `join-${DateTime.now().getTime()}`,
              type: 'JOIN_ROOM',
              payload: { userId, roomId },
              timestamp: DateTime.now().getTime()
            });
            
            return right(true);
          }
        }
      }
    }
  };
  
  def isRateLimited :: (userId :: number) -> boolean = (userId) => {
    def now :: number = DateTime.now().getTime();
    def window :: number = 60000; // 1 minute
    def maxMessages :: number = 30;
    
    def timestamps :: number[] = this.rateLimiter.get(userId) || [];
    def recentTimestamps :: number[] = timestamps.filter((t) => now - t < window);
    
    this.rateLimiter.set(userId, recentTimestamps);
    
    return recentTimestamps.length >= maxMessages;
  };
  
  def recordMessage :: (userId :: number) -> void = (userId) => {
    def timestamps :: number[] = this.rateLimiter.get(userId) || [];
    timestamps.push(DateTime.now().getTime());
    this.rateLimiter.set(userId, timestamps);
  };
  
  def broadcastToRoom :: (roomId :: number, message :: any, excludeUserId :: number) -> void = (roomId, message, excludeUserId) => {
    def usersInRoom :: number[] = Array.from(this.userRooms.entries())
      |> filter(([userId, rooms]) => rooms.has(roomId) && userId !== excludeUserId)
      |> map(([userId]) => userId);
    
    def broadcasts :: Promise<void>[] = usersInRoom |> map(async (userId) => {
      def connectionInfo :: ConnectionInfo | undefined = this.connections.get(userId);
      match connectionInfo {
        case undefined => {}
        case info if info.ws.readyState === WebSocket.OPEN => {
          info.ws.send(JSON.stringify(message));
          info.lastActivity = DateTime.now();
        }
        case _ => {}
      }
    });
    
    Promise.all(broadcasts);
  };
  
  def sendToUser :: (userId :: number, message :: any) -> boolean = (userId, message) => {
    def connectionInfo :: ConnectionInfo | undefined = this.connections.get(userId);
    
    match connectionInfo {
      case undefined => false
      case info if info.ws.readyState === WebSocket.OPEN => {
        info.ws.send(JSON.stringify(message));
        info.lastActivity = DateTime.now();
        return true;
      }
      case _ => false
    }
  };
  
  def getActiveConnections :: () -> number = () => {
    return this.connections.size;
  };
  
  def cleanupStaleConnections :: () -> void = () => {
    def cutoffTime :: DateTime = DateTime.now().subtract(30, 'minutes');
    def staleUsers :: number[] = [];
    
    this.connections.forEach((info, userId) => {
      match info.lastActivity.isBefore(cutoffTime) {
        case true => staleUsers.push(userId)
        case false => {}
      }
    });
    
    staleUsers.forEach((userId) => this.removeConnection(userId));
  };
}

def connectionManager :: ConnectionManager = new ConnectionManager();

// Enhanced HTTP Server setup
def app :: HTTP.Server = HTTP.createServer();

// Middleware
app.use(HTTP.middleware.json());
app.use(HTTP.middleware.cors());

// Rate limiting middleware
def rateLimitMiddleware :: (req :: HTTP.Request, res :: HTTP.Response, next :: Function) -> void = 
  (req, res, next) => {
    def userId :: number = req.user?.id;
    
    match userId && connectionManager.isRateLimited(userId) {
      case true => res.status(429).json({ error: 'Rate limit exceeded' })
      case false => {
        match userId {
          case undefined => {}
          case id => connectionManager.recordMessage(id)
        }
        next();
      }
    }
  };

// REST API endpoints with enhanced functionality
app.get("/rooms", async (req :: HTTP.Request, res :: HTTP.Response) => {
  try {
    def { page = "1", limit = "20", category } = req.query;
    def pageNum :: number = parseInt(page);
    def limitNum :: number = parseInt(limit);
    def offset :: number = (pageNum - 1) * limitNum;
    
    def query = Database.query<ChatRoom>()
      .where((r) => !r.isPrivate);
    
    def filteredQuery = match category {
      case undefined => query
      case cat => query.where((r) => r.name.toLowerCase().includes(cat.toLowerCase()))
    };
    
    def rooms :: ChatRoom[] = await filteredQuery
      .orderBy("createdAt", "desc")
      .offset(offset)
      .limit(limitNum)
      .execute();
    
    def total :: number = await Database.count<ChatRoom>();
    
    res.json({
      rooms,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error :: Error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/rooms", rateLimitMiddleware, async (req :: HTTP.Request, res :: HTTP.Response) => {
  try {
    def { name, description, isPrivate = false, maxMembers = 100 } = req.body;
    def ownerId :: number = req.user?.id; // Assume authentication middleware
    
    match !name || name.trim().length === 0 {
      case true => {
        res.status(400).json({ error: 'Room name is required' });
        return;
      }
      case false => {
        def room :: ChatRoom = new ChatRoom({
          name: name.trim(),
          description: description || "",
          isPrivate,
          maxMembers,
          ownerId
        });
        
        def savedRoom :: ChatRoom = await Database.save(room);
        
        res.status(201).json({
          message: 'Room created successfully',
          room: savedRoom
        });
      }
    }
  } catch (error :: Error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/rooms/:id/messages", async (req :: HTTP.Request, res :: HTTP.Response) => {
  try {
    def roomId :: number = parseInt(req.params.id);
    def { page = "1", limit = "50", before } = req.query;
    def pageNum :: number = parseInt(page);
    def limitNum :: number = Math.min(parseInt(limit), 100); // Max 100 messages
    
    match isNaN(roomId) {
      case true => res.status(400).json({ error: 'Invalid room ID' })
      case false => {
        def query = Database.query<Message>()
          .where((m) => m.roomId === roomId)
          .include('user');
        
        def filteredQuery = match before {
          case undefined => query
          case timestamp => query.where((m) => m.sentAt.isBefore(new DateTime(timestamp)))
        };
        
        def messages :: Message[] = await filteredQuery
          .orderBy("sentAt", "desc")
          .limit(limitNum)
          .execute();
        
        res.json({
          messages: messages.reverse(), // Return in chronological order
          hasMore: messages.length === limitNum,
          roomId
        });
      }
    }
  } catch (error :: Error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/analytics/rooms", async (req :: HTTP.Request, res :: HTTP.Response) => {
  try {
    def analytics = {
      totalRooms: await Database.count<ChatRoom>(),
      totalMessages: await Database.count<Message>(),
      activeConnections: connectionManager.getActiveConnections(),
      onlineUsers: await UserPresenceActor.ask({
        id: `analytics-${DateTime.now().getTime()}`,
        type: 'GET_ONLINE_USERS',
        payload: {},
        timestamp: DateTime.now().getTime()
      })
    };
    
    res.json({ analytics });
  } catch (error :: Error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket server setup with enhanced error handling
def wss :: WebSocket.Server = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws :: WebSocket, req :: any) => {
  def userId :: number | null = null;
  def isAuthenticated :: boolean = false;
  
  ws.on('message', async (data :: string) => {
    try {
      def message :: any = JSON.parse(data);
      
      match message.type {
        case "AUTH" => {
          // Enhanced authentication (simplified)
          userId = message.userId;
          def authResult :: Either<string, boolean> = connectionManager.addConnection(userId, ws);
          
          match authResult {
            case left(error) => {
              ws.send(JSON.stringify({
                type: 'AUTH_ERROR',
                message: error
              }));
            }
            case right(_) => {
              isAuthenticated = true;
              ws.send(JSON.stringify({
                type: 'AUTH_SUCCESS',
                message: 'Connected successfully',
                userId
              }));
            }
          }
        }
        
        case "JOIN_ROOM" => {
          match isAuthenticated && userId {
            case false => ws.send(JSON.stringify({ type: 'ERROR', message: 'Not authenticated' }))
            case true => {
              def { roomId } = message;
              def joinResult :: Either<string, boolean> = await connectionManager.joinRoom(userId, roomId);
              
              match joinResult {
                case left(error) => {
                  ws.send(JSON.stringify({
                    type: 'JOIN_ERROR',
                    message: error,
                    roomId
                  }));
                }
                case right(_) => {
                  def roomState :: any = await ChatRoomActor.ask({
                    id: `get-state-${DateTime.now().getTime()}`,
                    type: 'GET_ROOM_STATE',
                    payload: { roomId },
                    timestamp: DateTime.now().getTime()
                  });
                  
                  ws.send(JSON.stringify({
                    type: 'ROOM_JOINED',
                    roomId,
                    state: roomState
                  }));
                  
                  connectionManager.broadcastToRoom(roomId, {
                    type: 'USER_JOINED_ROOM',
                    userId,
                    roomId,
                    timestamp: DateTime.now().toISOString()
                  }, userId);
                }
              }
            }
          }
        }
        
        case "SEND_MESSAGE" => {
          match isAuthenticated && userId {
            case false => ws.send(JSON.stringify({ type: 'ERROR', message: 'Not authenticated' }))
            case true => {
              match connectionManager.isRateLimited(userId) {
                case true => {
                  ws.send(JSON.stringify({
                    type: 'RATE_LIMITED',
                    message: 'Too many messages, please slow down'
                  }));
                }
                case false => {
                  def { roomId, content, messageType, replyToId, metadata } = message;
                  
                  def result :: any = await ChatRoomActor.ask({
                    id: `msg-${DateTime.now().getTime()}`,
                    type: 'SEND_MESSAGE',
                    payload: { userId, roomId, content, messageType, replyToId, metadata },
                    timestamp: DateTime.now().getTime()
                  });
                  
                  match result.type {
                    case "ERROR" => ws.send(JSON.stringify(result))
                    case "MESSAGE_SENT" => {
                      connectionManager.recordMessage(userId);
                      connectionManager.broadcastToRoom(roomId, {
                        type: 'NEW_MESSAGE',
                        message: result.message,
                        memberCount: result.memberCount
                      }, null);
                    }
                    case _ => {}
                  }
                }
              }
            }
          }
        }
        
        case "EDIT_MESSAGE" => {
          match isAuthenticated && userId {
            case false => ws.send(JSON.stringify({ type: 'ERROR', message: 'Not authenticated' }))
            case true => {
              def { messageId, newContent } = message;
              
              def result :: any = await ChatRoomActor.ask({
                id: `edit-${DateTime.now().getTime()}`,
                type: 'EDIT_MESSAGE',
                payload: { userId, messageId, newContent },
                timestamp: DateTime.now().getTime()
              });
              
              match result.type {
                case "ERROR" => ws.send(JSON.stringify(result))
                case "MESSAGE_EDITED" => {
                  connectionManager.broadcastToRoom(result.message.roomId, {
                    type: 'MESSAGE_EDITED',
                    message: result.message
                  }, null);
                }
                case _ => {}
              }
            }
          }
        }
        
        case "START_TYPING" => {
          match isAuthenticated && userId {
            case false => {}
            case true => {
              def { roomId } = message;
              
              ChatRoomActor.send({
                id: `typing-${DateTime.now().getTime()}`,
                type: 'START_TYPING',
                payload: { userId, roomId },
                timestamp: DateTime.now().getTime()
              });
              
              connectionManager.broadcastToRoom(roomId, {
                type: 'USER_TYPING',
                userId,
                roomId
              }, userId);
            }
          }
        }
        
        case "STOP_TYPING" => {
          match isAuthenticated && userId {
            case false => {}
            case true => {
              def { roomId } = message;
              
              ChatRoomActor.send({
                id: `stop-typing-${DateTime.now().getTime()}`,
                type: 'STOP_TYPING',
                payload: { userId, roomId },
                timestamp: DateTime.now().getTime()
              });
              
              connectionManager.broadcastToRoom(roomId, {
                type: 'USER_STOPPED_TYPING',
                userId,
                roomId
              }, userId);
            }
          }
        }
        
        case "ADD_REACTION" => {
          match isAuthenticated && userId {
            case false => ws.send(JSON.stringify({ type: 'ERROR', message: 'Not authenticated' }))
            case true => {
              def { messageId, emoji } = message;
              
              def result :: any = await ChatRoomActor.ask({
                id: `reaction-${DateTime.now().getTime()}`,
                type: 'ADD_REACTION',
                payload: { userId, messageId, emoji },
                timestamp: DateTime.now().getTime()
              });
              
              match result.type {
                case "ERROR" => ws.send(JSON.stringify(result))
                case "REACTION_ADDED" => {
                  connectionManager.broadcastToRoom(result.roomId, {
                    type: 'REACTION_ADDED',
                    message: result.message,
                    userId: result.userId,
                    emoji: result.emoji
                  }, null);
                }
                case _ => {}
              }
            }
          }
        }
        
        case "HEARTBEAT" => {
          match isAuthenticated && userId {
            case false => {}
            case true => {
              UserPresenceActor.send({
                id: `heartbeat-${DateTime.now().getTime()}`,
                type: 'HEARTBEAT',
                payload: { userId },
                timestamp: DateTime.now().getTime()
              });
              
              ws.send(JSON.stringify({
                type: 'HEARTBEAT_ACK',
                timestamp: DateTime.now().toISOString()
              }));
            }
          }
        }
        
        case _ => {
          ws.send(JSON.stringify({
            type: 'ERROR',
            message: 'Unknown message type'
          }));
        }
      }
    } catch (error :: Error) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: error.message
      }));
    }
  });
  
  ws.on('close', () => {
    match userId {
      case null => {}
      case id => connectionManager.removeConnection(id)
    }
  });
  
  ws.on('error', (error :: Error) => {
    Console.error('WebSocket error:', error);
  });
});

// Enhanced cleanup and maintenance
def cleanupInterval :: any = setInterval(() => {
  connectionManager.cleanupStaleConnections();
  
  UserPresenceActor.send({
    id: `cleanup-${DateTime.now().getTime()}`,
    type: 'CLEANUP_STALE_USERS',
    payload: {},
    timestamp: DateTime.now().getTime()
  });
  
  Console.log(`Cleanup completed. Active connections: ${connectionManager.getActiveConnections()}`);
}, 300000); // 5 minutes

// Graceful shutdown
process.on('SIGTERM', () => {
  Console.log('Shutting down chat server...');
  clearInterval(cleanupInterval);
  wss.close();
  process.exit(0);
});

Console.log('🚀 Modern Chat Server running on:');
Console.log('📡 HTTP API: http://localhost:3000');
Console.log('🔌 WebSocket: ws://localhost:8080');
Console.log('⚡ Features: Real-time messaging, Reactions, Typing indicators, Rate limiting');

// Start HTTP server
def PORT :: number = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  Console.log(`✅ HTTP server listening on port ${PORT}`);
});