require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "employee_portal",
});

app.use(cors());
app.use(express.json());

async function checkDatabaseConnection() {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch (error) {
    console.error("Database connection check failed:", error.message);
    return false;
  }
}

app.get("/health", async (req, res) => {
  const databaseConnected = await checkDatabaseConnection();

  res.status(databaseConnected ? 200 : 503).json({
    status: "Backend API is running",
    database: databaseConnected ? "Connected" : "Not connected",
  });
});

app.get("/employees", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, department FROM employees ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error loading employees:", error.message);
    res.status(500).json({
      error: "Could not load employees.",
    });
  }
});

app.post("/employees", async (req, res) => {
  const { name, department } = req.body;

  if (!name || !department) {
    return res.status(400).json({
      error: "Name and department are required.",
    });
  }

  try {
    const result = await pool.query(
      "INSERT INTO employees (name, department) VALUES ($1, $2) RETURNING id, name, department",
      [name, department]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding employee:", error.message);
    return res.status(500).json({
      error: "Could not add employee.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Employee Portal API listening on port ${PORT}`);
});
