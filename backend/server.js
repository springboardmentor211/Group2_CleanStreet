const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// User routes
app.use('/api/users', require('./routes/user.routes'));

app.get('/', (req, res) => {
  res.send('Clean Street Backend Running');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
