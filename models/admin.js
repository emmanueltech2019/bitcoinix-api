const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
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
  AdminId: {
    type: String,
    required: true,
    minlength: 6,
    unique: true 
  },
});

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;