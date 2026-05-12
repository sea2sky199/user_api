const express = require('express');
const db = require('./db'); // The file created in step 3
const app = express();

app.use(express.json());

// Example: Fetch all users from a "users" table
app.get('/users', async (req, res) => {
  try {
    const users = await db.select('*').from('users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Example: Insert a new user
app.post('/users', async (req, res) => {
  try {
    const [id] = await db('users').insert({
      name: req.body.name,
      email: req.body.email
    });
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));

