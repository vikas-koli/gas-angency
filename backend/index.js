const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const db = require('./models/db.connection.on');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Database connection
db.mongoose.connect(db.url)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => {
        console.error("Failed to Connect", err);
        process.exit();
    });

// Routes
require('./routes/admin.routes')(app);
// require('./routes/employee.routes')(app);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'website')));
app.use(express.static(path.join(__dirname, 'website/out')));
app.use(express.static(path.join(__dirname, 'website/admin-panel')));

// Frontend routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'website/out', 'index.html'));
});

app.get('/admin-panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'website/admin-panel', 'index.html'));
});

// ✅ Dynamic port (for deployment or local)
const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`✅ Server started on port ${port}`);
});
