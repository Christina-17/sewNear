const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");  // ✅ Import 'path' module
const app = express();
app.use(cors());
app.use(express.json());  // ✅ Required to parse JSON requests
const allowedOrigins = ["http://127.0.0.1:5500", "http://localhost:5000"]; // ✅ Add trusted frontend URLs

// CORS Middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) { 
        res.header("Access-Control-Allow-Origin", origin); // ✅ Allow only trusted origins
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
    next();
});
app.use(express.urlencoded({ extended: true }));

const authRoutes = require("./routes/authRoutes");
const tailorRoutes = require("./routes/tailorroutes");

app.use("/auth", authRoutes);
app.use("/tailor", tailorRoutes);

app.use("/uploads", express.static("uploads"));

// ✅ Serve static files (Fixes 404 for HTML, images, etc.)
app.use(express.static(path.join(__dirname, "public"))); 
app.use(express.static(path.join(__dirname, "public")));  

mongoose.connect("mongodb://localhost:27017/sewNearDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err)); 
module.exports = mongoose;
app.listen(5000, () => console.log("Server running on port 5000"+" http://localhost:5000/index.html"));

