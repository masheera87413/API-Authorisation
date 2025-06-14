const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

async function verifyAPIKey(req, res, next) {
    const apiKey = req.headers["authorization"];
    if (!apiKey) {
        return res.status(401).json({ error: "Authorization header missing" });
    }

    const user = await User.findOne({ apiKey });
    if (!user) {
        return res.status(403).json({ error: "Invalid API key" });
    }

    req.user = user;
    next();
}

app.post("/register", async (req, res) => {
    const { username, apiKey } = req.body;
    if (!username || !apiKey) {
        return res.status(400).json({ error: "Username and API key required" });
    }

    try {
        const user = new User({ username, apiKey });
        await user.save();
        res.json({ message: "User registered successfully", user });
    } catch (err) {
        res.status(500).json({ error: "Could not register user", details: err.message });
    }
});

app.get("/public", (req, res) => {
    res.json({ message: "This is a public endpoint." });
});

app.get("/secure", verifyAPIKey, (req, res) => {
    res.json({ message: `Hello ${req.user.username}, you are authorized!` });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
