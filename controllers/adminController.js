const Admin = require("../models/admin")
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Deposit = require("../models/deposit");
const User = require("../models/user");
const Withdrawal = require("../models/withdraw");

function generateSixDigitCode() {
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number

  // Generate a random number between min and max (inclusive)
  const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;

  // Convert the random number to a string with leading zeros (if required)
  const sixDigitCode = String(randomCode).padStart(6, '0');

  return sixDigitCode;
}
// Register a new Admin
module.exports.registerAdmin = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      // Check if the email is already registered
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Email already registered' });
      }
  
      // Hash the password before saving to the database
      const AdminId =  generateSixDigitCode()
  
      // Create a new Admin object
      const newAdmin = new Admin({
        name,
        email,
        password,
        AdminId
      });
  
      // Save the new Admin to the database
      await newAdmin.save();
  
      return res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
      console.error('Error during Admin registration:', error);
      // Check if the error is a Mongoose ValidationError
      if (error instanceof mongoose.Error.ValidationError) {
        // Extract the validation error messages
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ errors: validationErrors });
      }
  
      console.error('Error during Admin registration:', error);
      return res.status(500).json({ message: 'Internal server error' });
      
    }
  };
  
  
  
  // Login Admin
  module.exports.loginAdmin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if the Admin with the provided email exists
      const newAdmin = await Admin.findOne({ email });
      if (!newAdmin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      // Check if the provided password matches the stored hashed password
      // const isPasswordValid = password, Admin.password
      if (password!==newAdmin.password) {
        return res.status(401).json({ message: 'Invalid password' });
      }
  
      // If the password is valid, create a JSON Web Token (JWT) to authenticate the Admin
      const token = jwt.sign({ AdminId: newAdmin._id }, process.env.APP_SECRET);
  
      // You can set the token as an HTTP-only cookie to enhance security
      // res.cookie('token', token, { httpOnly: true });
  
      return res.status(200).json({ token, message: 'Login successful' });
    } catch (error) {
      console.error('Error during Admin login:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  module.exports.getDeposits = async (req, res) => {
    try {
      // Fetch all deposits from the database
      const deposits = await Deposit.find({});
  
      return res.status(200).json(deposits);
    } catch (error) {
      console.error('Error while fetching deposits:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  module.exports.getWithdrawals = async (req, res) => {
    try {
      // Fetch all deposits from the database
      const withdraws = await Withdrawal.find({});
  
      return res.status(200).json(withdraws);
    } catch (error) {
      console.error('Error while fetching withdrawals:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  module.exports.getUsers = async (req, res) => {
    try {
      // Fetch all deposits from the database
      const users = await User.find({});
  
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error while fetching users:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  module.exports.getUserProfile = async (req, res) => {
    try {
      const {userId} =req.body
      // Fetch all deposits from the database
      const user = await User.findOne(userId);
  
      return res.status(200).json(user);
    } catch (error) {
      console.error('Error while fetching users:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  module.exports.approveDeposit = async (req, res) => {
    try {
      const { userId, depositId } = req.body;
  
      // Check if the user exists in the database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const newDeposit = await Deposit.findById(depositId);
      newDeposit.status = "approved"
      // Update the user's account balance
      user.balance += newDeposit.amount;
      user.deposited += newDeposit.amount;
      await user.save();
      await newDeposit.save();
  
      return res.status(201).json({ message: 'Deposit approved successful' });
  
    } catch (error) {
      console.error('Error during deposit:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  module.exports.getAdminProfile = async (req, res) => {
    try {
      const { AdminId } = req.user;
      console.log(req.user)
      // Fetch the user profile from the database
      const adminProfile = await Admin.findById(AdminId);
  
      if (!adminProfile) {
        return res.status(404).json({ message: 'Admin profile not found' });
      }
  
      // Remove sensitive information before sending the response (optional)
      // const { password, ...profileData } = adminProfile.toObject();
  
      return res.status(200).json(adminProfile);
    } catch (error) {
      console.error('Error while fetching user profile:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  module.exports.updateAdminInfo = async (req, res) => {
    try {
      const AdminId = req.user.AdminId
      const { name, email, password } = req.body;
  
      // Check if the user exists in the database
      const admin = await Admin.findById(AdminId);
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  
      // Update the user's name and email
      admin.name = name;
      admin.email = email;
      admin.password = password;
      await admin.save();
  
      return res.status(200).json({ message: 'Admin information updated successfully', admin });
    } catch (error) {
      console.error('Error during admin information update:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  exports.getAllSums = async (req, res) => {
    try {
      const adminId = req.user.adminId
  
      // Find all withdrawals and deposits of the specific user
      const withdrawals = await Withdrawal.find({  });
      const deposits = await Deposit.find({  });
  
       // Add a "transaction type" field to each record in withdrawals and deposits arrays
       const withdrawalsWithTypes = withdrawals.map((withdrawal) => ({
        ...withdrawal._doc,
        transactionType: 'withdrawal',
      }));
      const depositsWithTypes = deposits.map((deposit) => ({
        ...deposit._doc,
        transactionType: 'deposit',
      }));
  
      // Combine withdrawals and deposits into a single transaction history array
      const transactionHistory = [...withdrawalsWithTypes, ...depositsWithTypes];
  
      // Sort the transaction history by date in descending order
      transactionHistory.sort((a, b) => b.date - a.date);
  
      // Calculate total deposit and total withdrawal
      const totalDeposit = deposits.reduce((total, deposit) => total + deposit.amount, 0);
      const totalWithdrawal = withdrawals.reduce((total, withdrawal) => total + withdrawal.amount, 0);
  
      // Check if the user exists and retrieve their balance
      const user = await User.find();
     
  
      res.status(200).json({ transactionHistory, totalDeposit, totalWithdrawal, balance:user.balance, users:user.length });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Could not retrieve transaction history.' });
    }
  };

  module.exports.updateBalance = async (req, res) => {
    try {
      const { balance, id } = req.body;
  
      // Check if the user exists in the database
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update the user's balance
      user.balance = balance;

      await user.save();
  
      return res.status(200).json({ message: 'Admin information updated successfully', user });
    } catch (error) {
      console.error('Error during user information update:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };