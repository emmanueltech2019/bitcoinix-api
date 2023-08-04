const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6 
  },
  UserId: {
    type: String,
    required: true,
    minlength: 6,
    unique: true 
  },
  balance:{
    type: Number,
    default:0,
    required:true
  },
  profit:{
    type: Number,
    default:0,
    required:true
  },
  deposited:{
    type: Number,
    default:0,
    required:true
  },
  
});

const User = mongoose.model('User', userSchema);

module.exports = User;