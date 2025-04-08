const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const router = express.Router();
// ✅ Define User Schema (Handles Both Users & Tailors)
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "tailor"], required: true } // User Role
});

const User = mongoose.model("User", userSchema);


// ✅ SIGNUP Route (For Both Users & Tailors)
router.post("/signup", async (req, res, next) => {
    const { name, contact, password, role } = req.body;

    if (!name || !contact || !password || !role) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    if (!contact.trim()) {
        return res.status(400).json({ message: "Contact number is required!" });
    }

    try {
        const existingUser = await User.findOne({ contact:req.body.contact  });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, contact, password: hashedPassword, role });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully!", user: newUser });
    } catch (error) {
        next(error);
    }
});


// ✅ LOGIN Route (For Both Users & Tailors)
router.post("/signin", async (req, res, next) => {
  const { mobile, password, role } = req.body; 

  if (!mobile || !role) {
      return res.status(400).json({ message: "Mobile number and role are required!" });
  }

  try {
      const user = await User.findOne({ contact : mobile });

      if (!user) {
          return res.status(400).json({ message: "User not found!" });
      }

      // Tailors do not require a password
      if (user.role === "tailor") {
          return res.json({ message: "Tailor login successful!", user });
      }

      // Customers must provide a password
      if (user.role === "user") {
          if (!password) {
              return res.status(400).json({ message: "Password is required for customers!" });
          }

          const passwordMatch = await bcrypt.compare(password, user.password);
          if (!passwordMatch) {
              return res.status(400).json({ message: "Invalid password!" });
          }
      }

      res.json({ message: `${user.role} login successful!`, user });
  } catch (error) {
      next(error);
  }
});
router.get("/users", async (req, res) => {
    try {
        const users = await User.find({}, "name contact role"); // ✅ Use 'mobile'
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Error fetching users" });
    }
});

// ✅ Global Error Handler
router.use((err, req, res, next) => {
    console.error("❌ Error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
});

module.exports = router;

