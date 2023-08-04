const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (replace 'User' with the actual name of your User model)
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status:{
    type:String,
    default:"pending"
  }
});

const Deposit = mongoose.model('Deposit', depositSchema);

module.exports = Deposit;
