const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;


app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// User schema and model
const userSchema = new mongoose.Schema({
  username: String,
  apiKey: String,
});

const User = mongoose.model('User', userSchema);


function verifyAPIKey(req, res, next) {
    const key = req.headers['authorization'];
    if (!key) {
        return res.status(401).json({ error: "Authorization header missing" });
    }
    if (key !== API_KEY) {
        return res.status(403).json({ error: "Invalid API key" });
    }
    next();
}

app.post('/register', async (req, res) => {
  const { username, apiKey } = req.body;
  try {
    const user = new User({ username, apiKey });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});


app.get('/public', (req, res) => {
    res.json({ message: "This is a public endpoint. No API key needed." });
});


app.get('/secure', async (req, res) => {
  const apiKey = req.headers['authorization']; 

  if (!apiKey) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const user = await User.findOne({ apiKey }); 

  if (!user) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  return res.status(200).json({ message: 'This is a secure endpoint. You have been authorized!' });
});


app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});

