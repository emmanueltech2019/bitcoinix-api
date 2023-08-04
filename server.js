const express = require('express');
const userRoutes =  require("./routes/users")
const adminRoutes = require("./routes/admin")
const userController = require('./controllers/userController')
const cron = require('node-cron');

const app = express(); 
require("dotenv").config()

// Add middleware and routes here
const cors = require('cors');
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("/api/v1/user",userRoutes)
app.use("/api/v1/admin",adminRoutes)



const mongoose = require('mongoose');
const MONGODB_URI = process.env.DB
const PORT = process.env.PORT || 5000

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

// Schedule the task to run once every day at a specific time (e.g., 1:00 AM)
// cron.schedule('0 1 * * *', () => {
//   userController.updateUserProfit();
// }, {
//   scheduled: true,
//   timezone: 'America/New_York'
// });

cron.schedule('* * * * *', () => {
  userController.updateUserProfit();
}, {
  scheduled: true,
  timezone: 'America/New_York'
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
