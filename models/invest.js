const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (replace 'User' with the actual name of your User model)
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  plan:{
    type:String,
    required:true
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status:{
    type:String,
    default:"running"
  }
});

const Investment = mongoose.model('Investment', investmentSchema);

module.exports = Investment;
