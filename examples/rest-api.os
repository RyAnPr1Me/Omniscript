use { HTTP, Database, DateTime, UUID } from 'stdlib';

// Define data model with decorators and type annotations
object User {
  @id id :: number;
  @field name :: string;
  @field email :: string;
  @field age :: number;
  @timestamp createdAt :: DateTime;
  @timestamp updatedAt :: DateTime;
  
  constructor(data :: UserInput) {
    this.name = data.name;
    this.email = data.email;
    this.age = data.age;
    this.createdAt = DateTime.now();
    this.updatedAt = DateTime.now();
  }
  
  def validate :: () -> Either<string, boolean> = () => {
    match {
      case this.name.length === 0 => left("Name is required")
      case !this.email.includes("@") => left("Invalid email format")
      case this.age < 0 => left("Age must be positive")
      case _ => right(true)
    }
  };
}

// Input type for user creation
type UserInput = {
  name :: string,
  email :: string,
  age :: number
};

// Response types
type ApiResponse<T> = {
  success :: boolean,
  data :: T,
  message :: string
};

type ErrorResponse = {
  success :: boolean,
  error :: string,
  code :: number
};

// Create REST API with modern syntax
def app :: HTTP.Server = HTTP.createServer();

// Middleware for JSON parsing and CORS
app.use(HTTP.middleware.json());
app.use(HTTP.middleware.cors());

// Error handling middleware
def handleError :: (error :: Error) -> ErrorResponse = (error) => ({
  success: false,
  error: error.message,
  code: error.code || 500
});

// GET /users - List all users with pagination
app.get("/users", async (req :: HTTP.Request, res :: HTTP.Response) => {
  def page :: number = parseInt(req.query.page) || 1;
  def limit :: number = parseInt(req.query.limit) || 10;
  def offset :: number = (page - 1) * limit;
  
  try {
    def users :: User[] = await Database.query<User>()
      .orderBy("createdAt", "desc")
      .offset(offset)
      .limit(limit)
      .execute();
    
    def total :: number = await Database.count<User>();
    
    def response :: ApiResponse<{ users: User[], pagination: object }> = {
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: "Users retrieved successfully"
    };
    
    res.status(200).json(response);
  } catch (error :: Error) {
    res.status(500).json(handleError(error));
  }
});

// GET /users/:id - Get user by ID
app.get("/users/:id", async (req :: HTTP.Request, res :: HTTP.Response) => {
  def userId :: number = parseInt(req.params.id);
  
  match userId {
    case x if isNaN(x) => {
      res.status(400).json(handleError(new Error("Invalid user ID")));
      return;
    }
    case _ => {
      try {
        def user :: User | null = await Database.findById<User>(userId);
        
        match user {
          case null => res.status(404).json(handleError(new Error("User not found")))
          case user => res.status(200).json({
            success: true,
            data: user,
            message: "User retrieved successfully"
          })
        }
      } catch (error :: Error) {
        res.status(500).json(handleError(error));
      }
    }
  }
});

// POST /users - Create new user
app.post("/users", async (req :: HTTP.Request, res :: HTTP.Response) => {
  def userData :: UserInput = req.body;
  def user :: User = new User(userData);
  
  def validation :: Either<string, boolean> = user.validate();
  
  match validation {
    case left(error) => res.status(400).json(handleError(new Error(error)))
    case right(_) => {
      try {
        def savedUser :: User = await Database.save(user);
        res.status(201).json({
          success: true,
          data: savedUser,
          message: "User created successfully"
        });
      } catch (error :: Error) {
        res.status(500).json(handleError(error));
      }
    }
  }
});

// PUT /users/:id - Update user
app.put("/users/:id", async (req :: HTTP.Request, res :: HTTP.Response) => {
  def userId :: number = parseInt(req.params.id);
  def updates :: Partial<UserInput> = req.body;
  
  try {
    def existingUser :: User | null = await Database.findById<User>(userId);
    
    match existingUser {
      case null => res.status(404).json(handleError(new Error("User not found")))
      case user => {
        // Apply updates
        def updatedUser :: User = { ...user, ...updates, updatedAt: DateTime.now() };
        def validation :: Either<string, boolean> = updatedUser.validate();
        
        match validation {
          case left(error) => res.status(400).json(handleError(new Error(error)))
          case right(_) => {
            def savedUser :: User = await Database.save(updatedUser);
            res.status(200).json({
              success: true,
              data: savedUser,
              message: "User updated successfully"
            });
          }
        }
      }
    }
  } catch (error :: Error) {
    res.status(500).json(handleError(error));
  }
});

// DELETE /users/:id - Delete user
app.delete("/users/:id", async (req :: HTTP.Request, res :: HTTP.Response) => {
  def userId :: number = parseInt(req.params.id);
  
  try {
    def deleted :: boolean = await Database.deleteById<User>(userId);
    
    match deleted {
      case false => res.status(404).json(handleError(new Error("User not found")))
      case true => res.status(200).json({
        success: true,
        data: null,
        message: "User deleted successfully"
      })
    }
  } catch (error :: Error) {
    res.status(500).json(handleError(error));
  }
});

// Health check endpoint
app.get("/health", (req :: HTTP.Request, res :: HTTP.Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: "healthy",
      timestamp: DateTime.now(),
      uptime: process.uptime()
    },
    message: "Service is healthy"
  });
});

// Start server
def port :: number = process.env.PORT || 3000;
app.listen(port, () => {
  Console.log(`🚀 REST API server running on port ${port}`);
  Console.log(`📚 Available endpoints:`);
  Console.log(`  GET    /health`);
  Console.log(`  GET    /users`);
  Console.log(`  GET    /users/:id`);
  Console.log(`  POST   /users`);
  Console.log(`  PUT    /users/:id`);
  Console.log(`  DELETE /users/:id`);
});
