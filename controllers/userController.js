const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Deposit = require('../models/deposit');
const Withdrawal  = require("../models/withdraw")
const Investment = require('../models/invest'); 

require("dotenv").config() 

function generateSixDigitCode() {
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number

  // Generate a random number between min and max (inclusive)
  const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;

  // Convert the random number to a string with leading zeros (if required)
  const sixDigitCode = String(randomCode).padStart(6, '0');

  return sixDigitCode;
}

// Register a new user
module.exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password before saving to the database
    const UserId =  generateSixDigitCode()

    // Create a new user object
    const newUser = new User({
      name,
      email,
      password,
      UserId
    });

    // Save the new user to the database
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during user registration:', error);
    // Check if the error is a Mongoose ValidationError
    if (error instanceof mongoose.Error.ValidationError) {
      // Extract the validation error messages
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ errors: validationErrors });
    }

    console.error('Error during user registration:', error);
    return res.status(500).json({ message: 'Internal server error' });
    
  }
};

// Login user
module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user with the provided email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the provided password matches the stored hashed password
    // const isPasswordValid = password, user.password
    if (password!==user.password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // If the password is valid, create a JSON Web Token (JWT) to authenticate the user
    const token = jwt.sign({ userId: user._id }, process.env.APP_SECRET);

    // You can set the token as an HTTP-only cookie to enhance security
    // res.cookie('token', token, { httpOnly: true });

    return res.status(200).json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Error during user login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Deposit funds into the user's account
module.exports.depositFunds = async (req, res) => {
  try {
    console.log(req.user)
    const userId = req.user.userId
    const { amount } = req.body;

    // Check if the user exists in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new deposit object
    const newDeposit = new Deposit({
      userId,
      amount,
      date: new Date()
    });

    // Save the deposit information to the database
    await newDeposit.save();

    return res.status(201).json({ message: 'Deposit successful' });

  } catch (error) {
    console.error('Error during deposit:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports.getDeposits = async (req, res) => {
  try {
    const userId = req.user.userId

    // Fetch all deposits from the database
    const deposits = await Deposit.find({userId});

    return res.status(200).json(deposits);
  } catch (error) {
    console.error('Error while fetching deposits:', error);
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
    const newDeposit = await User.findById(depositId);
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

module.exports.declineDeposit = async (req, res) => {
  try {
    const { userId, depositId } = req.body;

    // Check if the user exists in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const newDeposit = await User.findById(depositId);
    newDeposit.status = "declined"

    await newDeposit.save();

    return res.status(201).json({ message: 'Deposit declined successful' });

  } catch (error) {
    console.error('Error during deposit:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Withdraw funds from the user's account
module.exports.withdrawFunds = async (req, res) => {
  try {
    const { amount, wallet, network } = req.body;
    const userId = req.user.userId

    // Check if the user exists in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has sufficient balance for withdrawal
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance for withdrawal' });
    }

    // Create a new withdrawal object
    const newWithdrawal = new Withdrawal({
      userId,
      amount,
      wallet, 
      network,
      date: new Date(),
      status: 'pending', // Set the status to 'pending' initially
    });

    // Save the withdrawal information to the database
    await newWithdrawal.save();

    // Deduct the withdrawal amount from the user's account balance
    user.balance -= amount;
    await user.save();

    return res.status(201).json({ message: 'Withdrawal request successful' });
  } catch (error) {
    console.error('Error during withdrawal:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports.getWithdrawals = async (req, res) => {
  try {
    // Fetch all withdrawals from the database
    const userId = req.user.userId
 
    // Fetch all deposits from the database
    const withdrawals = await Deposit.find({userId});

    return res.status(200).json(withdrawals);
  } catch (error) {
    console.error('Error while fetching withdrawals:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    // Fetch the user profile from the database
    const userProfile = await User.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Remove sensitive information before sending the response (optional)
    const { password, ...profileData } = userProfile.toObject();

    return res.status(200).json(profileData);
  } catch (error) {
    console.error('Error while fetching user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
module.exports.getUserProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the user profile from the database
    const userProfile = await User.findById(id);

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    return res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error while fetching user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports.updateUserInfo = async (req, res) => {
  try {
    const userId = req.user.userId
    const { name, email } = req.body;

    // Check if the user exists in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's name and email
    user.name = name;
    user.email = email;
    await user.save();

    return res.status(200).json({ message: 'User information updated successfully', user });
  } catch (error) {
    console.error('Error during user information update:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};





// Function to create a new investment
// exports.createInvestment = async (req, res) => {
//   try {
//     const userId = req.user.userId
//     const { amount, plan } = req.body;
    
//     // Check if the user exists and retrieve their balance
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found.' });
//     }
//     const userBalance = user.balance;
    
//     // Check if the user's balance is sufficient for the investment
//     if (userBalance < amount) {
//       return res.status(400).json({ error: 'Insufficient balance.' });
//     }
    
//     // Deduct the investment amount from the user's balance
//     const updatedBalance = userBalance - amount;
//     user.balance = updatedBalance;
//     await user.save();
    
//     // Create the new investment
//     const newInvestment = new Investment({
//       userId,
//       amount,
//       plan,
//     });
//     const savedInvestment = await newInvestment.save();
//     res.status(201).json(savedInvestment);
//   } catch (error) {
//     res.status(500).json({ error: 'Could not create the investment.' });
//   }
// };


module.exports.createInvestment = async (req, res) => {
  try {
    const userId = req.user.userId
    const { amount, plan } = req.body;
    
    // Check if the user exists and retrieve their balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const userBalance = user.balance;
    
    // Check if the investment amount is above the minimum required for the selected plan
    let minimumAmount;
    switch (plan) {
      case 'BASIC':
        minimumAmount = 500;
        break;
      case 'LITE':
        minimumAmount = 1000;
        break;
      case 'CLASSIC':
        minimumAmount = 2500;
        break;
      case 'SUITE':
        minimumAmount = 10000;
        break;
      case 'DELUXE':
        minimumAmount = 50000;
        break;
      default:
        return res.status(400).json({ message: 'Invalid plan selected.' });
    }
    
    if (amount < minimumAmount) {
      return res.status(400).json({ message: `Amount must be above ${minimumAmount} for plan ${plan}.` });
    }
    
    // Check if the user's balance is sufficient for the investment
    if (userBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance.' });
    }

    // Check if the user already has an active investment for the selected plan
    const existingInvestment = await Investment.findOne({ userId, plan });
    if (existingInvestment) {
      return res.status(400).json({ message: `You already have an active investment for ${plan}.` });
    }
    
    // Deduct the investment amount from the user's balance
    const updatedBalance = userBalance - amount;
    user.balance = updatedBalance;
    await user.save();
    
    // Create the new investment
    const newInvestment = new Investment({
      userId,
      amount,
      plan,
    });
    const savedInvestment = await newInvestment.save();

    res.status(201).json({savedInvestment, message:"Investment activated successfully"});
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Could not create the investment.' });
  }
};

module.exports.getInvestmentByUserId = async (req, res) => {
  try {
    const userId = req.user.userId
    const investment = await Investment.find({userId});
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found.' });
    }
    res.status(200).json(investment);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Could not retrieve the investment.' });
  }
};

// Function to get all investments
module.exports.getAllInvestments = async (req, res) => {
  try {
    const investments = await Investment.find();
    res.status(200).json(investments);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve investments.' });
  }
};

// Function to get a specific investment by ID
module.exports.getInvestmentById = async (req, res) => {
  try {
    const investmentId = req.params.id;
    const investment = await Investment.findById(investmentId);
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found.' });
    }
    res.status(200).json(investment);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve the investment.' });
  }
};

// Function to update the user's profit
module.exports.updateUserProfit = async (req, res) => {
  try {
    const users = await User.find();
    
    users.forEach(async (user) => {
      // Calculate 2.5% of the user's balance
      const profitToAdd = user.balance * 0.025;
      
      // Update the user's profit by adding the calculated value
      user.profit += profitToAdd;
      
      // Save the updated user data
      await user.save();
    });
    return
    // res.status(200).json({ message: 'User profits updated successfully.' });
  } catch (error) {
    return
    // res.status(500).json({ error: 'Could not update user profits.' });
  }
};

module.exports.getTotalInvestedAmount = async (req, res) => {
  try {
    const userId = req.user.userId
    // Find all investments of the specific user
    const investments = await Investment.find({ userId });

    // Calculate the total invested amount by summing the amounts of all investments
    let totalInvestedAmount = 0;
    investments.forEach((investment) => {
      totalInvestedAmount += investment.amount;
    });

    res.status(200).json({ totalInvestedAmount });
  } catch (error) {
    res.status(500).json({ error: 'Could not calculate total invested amount.' });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.userId

    // Find all withdrawals and deposits of the specific user
    const withdrawals = await Withdrawal.find({ userId });
    const deposits = await Deposit.find({ userId });

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
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ transactionHistory, totalDeposit, totalWithdrawal, balance:user.balance });
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve transaction history.' });
  }
};