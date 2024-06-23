import express from "express";
import { StreamClient } from "@stream-io/node-sdk";
import { config } from "dotenv";

const app = express();
const port = process.env.PORT || 3000;

const apiKey = process.env.STREAM_API_KEY;
const secret = process.env.STREAM_API_SECRET;
const client = new StreamClient(apiKey, secret, { timeout: 3000 });

app.use(express.json());

async function createUser(userId, role, name) {
  const newUser = {
    id: userId,
    role: role || "user",
    name: name || "John Doe",
  };
  await client.upsertUsers({
    users: {
      [newUser.id]: newUser,
    },
  });

  const exp = Math.round(new Date().getTime() / 1000) + 60 * 60;
  return client.createToken(userId, exp);
}

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.post("/createUser", async (req, res) => {
  const { userId, role, name } = req.body;
  try {
    const token = await createUser(userId, role, name);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
