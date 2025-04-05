const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Sample endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
