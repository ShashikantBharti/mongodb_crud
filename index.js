const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB Connection String
const MONGO_URI = 'mongodb://localhost:27017';
const DBNAME = 'demo';
let db;

// Connect to MongoDB
MongoClient.connect(MONGO_URI, { useUnifiedTopology: true })
  .then((client) => {
    console.log('Connected...');
    db = client.db(DBNAME);
  })
  .catch((error) => console.log(error));

// Routes

// Create a New User (POST)
app.post('/users', async (req, res) => {
  try {
    const user = req.body;
    const result = await db.collection('users').insertOne(user);

    const insertedUser = {
      _id: result.insertedId,
      ...user,
    };
    
    res.status(201).json(insertedUser); // Return the created user
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get All Users (GET)
app.get('/users', async (req, res) => {
  try {
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a user by ID (GET)
app.get('/users/:id', async (req, res) => {
  try {
    const user = await db
      .collection('users')
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a user by ID
app.put('/users/:id', async (req, res) => {
  try {
    const userUpdates = req.body;
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) }, // Filter by ID
      { $set: userUpdates } // Update Fields
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const updatedUser = await db
      .collection('users')
      .findOne({ _id: new ObjectId(req.params.id) });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete User by Id (DELETE)
app.delete('/users/:id', async (req, res) => {
  try {
    const result = await db
      .collection('users')
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deleteCount === 0) {
      return res.status(404).json({ message: 'User not Found!' });
    }

    res.json({ message: 'User deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
