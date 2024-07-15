const express = require("express");
const http = require("http");
const { createClient } = require("redis");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// set the view engine to ejs
app.set("view engine", "ejs");

// public folder to store assets
app.use(express.static(__dirname + "/public"));

// routes for app
app.get("/", (req, res) => {
  res.render("pad");
});
app.get("/:id", (req, res) => {
  res.render("pad");
});

// Create a redis client
const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

client.on("error", (err) => console.log("Redis Client Error encountered", err));

(async () => {
  try {
    await client.connect();
    console.log("Redis client connection established");

    // Create an HTTP server
    const server = http.createServer(app);

    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
    // Handle graceful shutdown
    const gracefulShutdown = () => {
      console.log("Shutting down gracefully...");
      server.close(async () => {
        console.log("HTTP server closed");
        try {
          await client.disconnect();
          console.log("Redis client disconnected");
          process.exit(0);
        } catch (err) {
          console.error("Failed to disconnect Redis client:", err);
          process.exit(1);
        }
      });
    };

    // Listen for termination signals
    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
  } catch (err) {
    console.error("Failed to establish Redis connection:", err);
  }
})();
