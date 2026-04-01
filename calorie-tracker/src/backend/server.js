const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/authdb");

// User model
const User = mongoose.model("User", new mongoose.Schema({
  username: String,
  password: String
}));

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    password: hashedPassword
  });

  await user.save();
  res.send("User registered");
});

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) return res.status(400).send("User not found");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.status(400).send("Invalid credentials");

  const token = jwt.sign({ id: user._id }, "secretkey");

  res.json({ token });
});

// PROTECTED ROUTE
app.get("/dashboard", (req, res) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(401).send("Access denied");

  try {
    const verified = jwt.verify(token, "secretkey");
    res.send("Protected data");
  } catch {
    res.status(400).send("Invalid token");
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));