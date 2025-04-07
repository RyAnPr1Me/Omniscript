import { HTTP, Database } from 'stdlib';

// Define data model
class User {
  @id id: number;
  @field name: string;
  @field email: string;
  @timestamp createdAt: DateTime;
}

// Create REST API
const app = new HTTP.Server();

app.get("/users", async (req, res) => {
  const users = await Database.query<User>()
    .orderBy("createdAt", "desc")
    .take(10);
  
  res.json(users);
});

app.post("/users", async (req, res) => {
  const user = new User(req.body);
  await Database.save(user);
  res.status(201).json(user);
});

app.listen(3000);
