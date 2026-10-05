require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const User = require("./models/User");
const Task = require("./models/Task");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const app = express();

app.use(cors());
app.use(express.json());


// ===============================
// MongoDB Connection
// ===============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });


// ===============================
// Home Route
// ===============================

app.get("/", (req, res) => {
  res.send("Backend server is running!");
});


// ===============================
// SIGNUP
// ===============================

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check empty fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all fields"
      });
    }

    // Check whether email already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    // Save user to MongoDB
    await newUser.save();

    res.status(201).json({
      message: "Account created successfully!"
    });

  } catch (error) {
    console.log("Signup error:", error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
});


// ===============================
// LOGIN
// ===============================

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check empty fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password"
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase()
    });

    // User doesn't exist
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    // Wrong password
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Login successful
    res.json({
      message: "Login successful!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.log("Login error:", error);

    res.status(500).json({
      message: "Something went wrong"
    });
  }
});
// ===============================
// GOOGLE LOGIN
// ===============================

app.post("/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required"
      });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const {
      sub: googleId,
      email,
      name,
      picture,
      email_verified
    } = payload;

    if (!email || !email_verified) {
      return res.status(401).json({
        message: "Google email could not be verified"
      });
    }

    // Check whether user already exists
    let user = await User.findOne({
      email: email.toLowerCase()
    });

    // Create user if they don't exist
    if (!user) {
      user = new User({
        name: name || "Google User",
        email: email.toLowerCase(),
        googleId,
        profilePicture: picture || ""
      });

      await user.save();
    } else {
      // Update Google information for an existing user
      user.googleId = googleId;
      user.profilePicture = picture || user.profilePicture || "";

      await user.save();
    }

    // Send user information to React
    res.json({
      message: "Google login successful!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || ""
      }
    });

  } catch (error) {
    console.log("Google login error:", error);

    res.status(401).json({
      message: "Google authentication failed"
    });
  }
});
// ==================== TASK APIs ====================

// Get all tasks for a user
app.get("/tasks/:userId", async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.log("Get tasks error:", error);

    res.status(500).json({
      message: "Unable to fetch tasks"
    });
  }
});


// Add a new task
app.post("/tasks", async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      priority,
      category,
      completed,
      userId
    } = req.body;
    console.log("TASK DATA RECEIVED:", req.body);


    if (!title || !userId) {
      return res.status(400).json({
        message: "Title and user ID are required"
      });
    }

    const newTask = new Task({
      title,
      description,
      date,
      time,
      priority,
      category,
      completed: completed || false,
      userId
    });

    await newTask.save();

    res.status(201).json({
      message: "Task created successfully",
      task: newTask
    });
  } catch (error) {
    console.log("Create task error:", error);

    res.status(500).json({
      message: "Unable to create task"
    });
  }
});


// Update a task
app.put("/tasks/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json({
      message: "Task updated successfully",
      task: updatedTask
    });
  } catch (error) {
    console.log("Update task error:", error);

    res.status(500).json({
      message: "Unable to update task"
    });
  }
});


// Delete a task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json({
      message: "Task deleted successfully"
    });
  } catch (error) {
    console.log("Delete task error:", error);

    res.status(500).json({
      message: "Unable to delete task"
    });
  }
});


// ===============================
// Start Server
// ===============================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});