import express from "express";
import Database from "better-sqlite3";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Express app
const app = express();
app.use(express.json());
app.use(cors());

// DB initialization
const dbPath = join(__dirname, "irctcDatabase.db");
const db = new Database(dbPath);

// Create tables if not exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    password TEXT,
    age INTEGER,
    gender TEXT
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    distance REAL NOT NULL,
    time_taken REAL NOT NULL,
    fare_ind REAL NOT NULL
  );
`).run();



// Start server
app.listen(3000, () => console.log("Server running at http://localhost:3000/"));

// Health check
app.get("/", (req, res) => res.send("API is Working"));

// JWT
const JWT_SECRET_KEY = "#JWT_SECRET_KEY";
const generateJWTToken = (id) => jwt.sign({ id }, JWT_SECRET_KEY, { expiresIn: "30d" });



// Register
app.post("/register", async (req, res) => {
  const { name, email, password, age, gender } = req.body;

  if (!name || !email || !password || !age || !gender)
    return res
      .status(400)
      .json({ success: false, message: "Name, Email, Password, Age and Gender are required" });

  try {
    const userExists = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
    if (userExists)
      return res.status(400).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const insert = db.prepare(`INSERT INTO users(name, email, password, age, gender) VALUES(?, ?, ?, ?, ?)`);
    const result = insert.run(name, email, hashedPassword, age, gender);

    const token = generateJWTToken(result.lastInsertRowid);
    res.status(200).json({ success: true, message: "User Registered Successfully", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);

  if (!user)
    return res.status(400).json({ success: false, message: "Invalid User" });

  try {
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ success: false, message: "Invalid Password" });

    const token = generateJWTToken(user.id);
    return res.status(200).json({ success: true, message: "Login Successful", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// AUTH MIDDLEWARE

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ success: false, message: "Invalid Token" });

  jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
    if (error)
      return res.status(403).json({ success: false, message: "Invalid Token" });
    req.userId = payload.id;
    next();
  });
};


// user profile
app.get("/profile", authenticateToken, (req, res) => {
  try {
    const user = db.prepare(`SELECT id, name, email FROM users WHERE id = ?`).get(req.userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User Not Found" });
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

