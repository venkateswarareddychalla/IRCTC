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
const dbPath = join(__dirname, "itctcDatabase.db");
const db = new Database(dbPath);

// Create tables if not exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    password TEXT,
    age INTEGER,
    gender TEXT,
    berth_preference TEXT
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

db.prepare(`
  CREATE TABLE IF NOT EXISTS trains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_number TEXT NOT NULL UNIQUE,
    train_name TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    date TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS train_classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_id INTEGER NOT NULL,
    class TEXT NOT NULL,
    quota TEXT NOT NULL,
    seats_available INTEGER NOT NULL,
    price REAL NOT NULL DEFAULT 500,
    FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE CASCADE
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS payment_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    details TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS passengers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    berth_preference TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    train_id INTEGER NOT NULL,
    passenger_ids TEXT NOT NULL,
    status TEXT NOT NULL,
    class TEXT,
    quota TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (train_id) REFERENCES trains(id)
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
    const user = db.prepare(`SELECT id, name, email, age, gender, berth_preference FROM users WHERE id = ?`).get(req.userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User Not Found" });
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Add payment method
app.post("/add-payment-method", authenticateToken, (req, res) => {
  const { type, details } = req.body;
  if (!type || !details)
    return res.status(400).json({ success: false, message: "Type and details are required" });

  try {
    const insert = db.prepare(`INSERT INTO payment_methods(user_id, type, details) VALUES(?, ?, ?)`);
    insert.run(req.userId, type, details);
    res.status(200).json({ success: true, message: "Payment method added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Save passenger details (update user)
app.post("/save-passenger", authenticateToken, (req, res) => {
  const { berth_preference } = req.body;
  try {
    const update = db.prepare(`UPDATE users SET berth_preference = ? WHERE id = ?`);
    update.run(berth_preference, req.userId);
    res.status(200).json({ success: true, message: "Passenger details saved" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Search trains
app.get("/search-trains", (req, res) => {
  const { origin, destination, date } = req.query;
  if (!origin || !destination || !date)
    return res.status(400).json({ success: false, message: "Origin, destination, and date are required" });

  try {
    const trains = db.prepare(`
      SELECT t.id, t.train_number, t.train_name, t.origin, t.destination, t.date, t.departure_time, t.arrival_time,
             tc.class, tc.quota, tc.seats_available, COALESCE(r.fare_ind, tc.price) as fare
      FROM trains t
      LEFT JOIN train_classes tc ON t.id = tc.train_id
      LEFT JOIN routes r ON t.origin = r.origin AND t.destination = r.destination
      WHERE LOWER(TRIM(t.origin)) LIKE LOWER(TRIM(?)) AND LOWER(TRIM(t.destination)) LIKE LOWER(TRIM(?)) AND t.date = ?
    `).all('%' + origin.trim() + '%', '%' + destination.trim() + '%', date);

    // Group by train
    const groupedTrains = trains.reduce((acc, train) => {
      const key = train.id;
      if (!acc[key]) {
        acc[key] = {
          id: train.id,
          train_number: train.train_number,
          train_name: train.train_name,
          origin: train.origin,
          destination: train.destination,
          date: train.date,
          departure_time: train.departure_time,
          arrival_time: train.arrival_time,
          classes: []
        };
      }
      acc[key].classes.push({
        class: train.class,
        quota: train.quota,
        seats_available: train.seats_available,
        fare: train.fare
      });
      return acc;
    }, {});

    const result = Object.values(groupedTrains);
    if (result.length === 0) {
      return res.status(200).json({ success: true, trains: result, message: "No trains found matching your search criteria." });
    }
    res.status(200).json({ success: true, trains: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Check availability
app.get("/check-availability", (req, res) => {
  const { train_id, class: trainClass, quota } = req.query;
  if (!train_id || !trainClass || !quota)
    return res.status(400).json({ success: false, message: "Train ID, class, and quota are required" });

  try {
    const train = db.prepare(`SELECT seats_available FROM train_classes WHERE train_id = ? AND class = ? AND quota = ?`).get(train_id, trainClass, quota);
    if (!train)
      return res.status(404).json({ success: false, message: "Train class not found" });
    res.status(200).json({ success: true, available: train.seats_available > 0, seats: train.seats_available });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Book ticket
app.post("/book-ticket", authenticateToken, (req, res) => {
  const { train_id, passenger_ids, class: trainClass, quota } = req.body; // passenger_ids as comma-separated string of user ids
  if (!train_id || !passenger_ids || !trainClass || !quota)
    return res.status(400).json({ success: false, message: "Train ID, passenger IDs, class, and quota are required" });

  try {
    const insert = db.prepare(`INSERT INTO bookings(user_id, train_id, passenger_ids, status, class, quota) VALUES(?, ?, ?, ?, ?, ?)`);
    const result = insert.run(req.userId, train_id, passenger_ids, "pending", trainClass, quota);
    res.status(200).json({ success: true, booking_id: result.lastInsertRowid, message: "Booking initiated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Confirm booking
app.post("/confirm-booking", authenticateToken, (req, res) => {
  const { booking_id, class: trainClass, quota } = req.body;
  if (!booking_id || !trainClass || !quota)
    return res.status(400).json({ success: false, message: "Booking ID, class, and quota are required" });

  try {
    const update = db.prepare(`UPDATE bookings SET status = ? WHERE id = ? AND user_id = ?`);
    update.run("confirmed", booking_id, req.userId);
    // Decrease seats
    const booking = db.prepare(`SELECT train_id, passenger_ids FROM bookings WHERE id = ? AND user_id = ?`).get(booking_id, req.userId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    const passengerCount = booking.passenger_ids.split(',').length;
    db.prepare(`UPDATE train_classes SET seats_available = seats_available - ? WHERE train_id = ? AND class = ? AND quota = ?`).run(passengerCount, booking.train_id, trainClass, quota);
    res.status(200).json({ success: true, message: "Booking confirmed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Cancel booking
app.post("/cancel-booking", authenticateToken, (req, res) => {
  const { booking_id, class: trainClass, quota } = req.body;
  if (!booking_id || !trainClass || !quota)
    return res.status(400).json({ success: false, message: "Booking ID, class, and quota are required" });

  try {
    const update = db.prepare(`UPDATE bookings SET status = ? WHERE id = ? AND user_id = ?`);
    update.run("cancelled", booking_id, req.userId);
    // Increase seats
    const booking = db.prepare(`SELECT train_id, passenger_ids FROM bookings WHERE id = ? AND user_id = ?`).get(booking_id, req.userId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    const passengerCount = booking.passenger_ids.split(',').length;
    db.prepare(`UPDATE train_classes SET seats_available = seats_available + ? WHERE train_id = ? AND class = ? AND quota = ?`).run(passengerCount, booking.train_id, trainClass, quota);
    res.status(200).json({ success: true, message: "Booking cancelled" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Add train (admin)
app.post("/add-train", (req, res) => {
  const { train_number, train_name, origin, destination, date, departure_time, arrival_time } = req.body;
  if (!train_number || !train_name || !origin || !destination || !date || !departure_time || !arrival_time)
    return res.status(400).json({ success: false, message: "All fields are required" });

  try {
    // Insert into trains table
    const insertTrain = db.prepare(`INSERT INTO trains(train_number, train_name, origin, destination, date, departure_time, arrival_time) VALUES(?, ?, ?, ?, ?, ?, ?)`);
    const trainResult = insertTrain.run(train_number, train_name, origin, destination, date, departure_time, arrival_time);
    const trainId = trainResult.lastInsertRowid;

    res.status(200).json({ success: true, message: "Train added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Get all trains (admin)
app.get("/get-trains", (req, res) => {
  try {
    const trains = db.prepare(`
      SELECT t.id, t.train_number, t.train_name, t.origin, t.destination, t.date, t.departure_time, t.arrival_time,
             tc.class, tc.quota, tc.seats_available, COALESCE(r.fare_ind, tc.price) as fare
      FROM trains t
      LEFT JOIN train_classes tc ON t.id = tc.train_id
      LEFT JOIN routes r ON t.origin = r.origin AND t.destination = r.destination
    `).all();

    // Group by train
    const groupedTrains = trains.reduce((acc, train) => {
      const key = train.id;
      if (!acc[key]) {
        acc[key] = {
          id: train.id,
          train_number: train.train_number,
          train_name: train.train_name,
          origin: train.origin,
          destination: train.destination,
          date: train.date,
          departure_time: train.departure_time,
          arrival_time: train.arrival_time,
          classes: []
        };
      }
      acc[key].classes.push({
        class: train.class,
        quota: train.quota,
        seats_available: train.seats_available,
        fare: train.fare
      });
      return acc;
    }, {});

    const result = Object.values(groupedTrains);
    res.status(200).json({ success: true, trains: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Get user bookings
app.get("/my-bookings", authenticateToken, (req, res) => {
  try {
    const bookings = db.prepare(`
      SELECT b.id, b.status, b.class, b.quota, t.train_number, t.origin, t.destination, t.date
      FROM bookings b
      JOIN trains t ON b.train_id = t.id
      WHERE b.user_id = ?
    `).all(req.userId);
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Add passenger to user's master list
app.post("/add-passenger", authenticateToken, (req, res) => {
  const { name, age, gender, berth_preference } = req.body;
  if (!name || !age || !gender)
    return res.status(400).json({ success: false, message: "Name, age, and gender are required" });

  try {
    const insert = db.prepare(`INSERT INTO passengers(user_id, name, age, gender, berth_preference) VALUES(?, ?, ?, ?, ?)`);
    const result = insert.run(req.userId, name, age, gender, berth_preference || null);
    res.status(200).json({ success: true, message: "Passenger added to master list", passenger_id: result.lastInsertRowid });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Get user's passenger master list
app.get("/my-passengers", authenticateToken, (req, res) => {
  try {
    const passengers = db.prepare(`SELECT id, name, age, gender, berth_preference FROM passengers WHERE user_id = ?`).all(req.userId);
    res.status(200).json({ success: true, passengers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Get all users (admin)
app.get("/get-all-users", (req, res) => {
  try {
    const users = db.prepare(`SELECT id, name, email, age, gender, berth_preference FROM users`).all();
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Get all bookings (admin)
app.get("/get-all-bookings", (req, res) => {
  try {
    const bookings = db.prepare(`
      SELECT b.id, b.status, b.passenger_ids, b.class, b.quota, u.name as user_name, u.email as user_email, t.train_number, t.train_name, t.origin, t.destination, t.date
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN trains t ON b.train_id = t.id
    `).all();
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Get user's payment methods
app.get("/get-payment-methods", authenticateToken, (req, res) => {
  try {
    const paymentMethods = db.prepare(`SELECT id, type, details FROM payment_methods WHERE user_id = ?`).all(req.userId);
    res.status(200).json({ success: true, paymentMethods });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

