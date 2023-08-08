const express = require("express")
const { registerAdmin, loginAdmin, getDeposits, approveDeposit, updateBalance, getWithdrawals, getUserProfile, getUsers, getAdminProfile, updateAdminInfo, getAllSums} = require("../controllers/adminController")
const { requireSignin, parser } = require("../middlewares")
const routes = express.Router()
const { getUserProfileById } = require("../controllers/userController")


routes.post("/register",registerAdmin)
routes.post("/login",loginAdmin)
routes.post("/deposit/approve", requireSignin, approveDeposit)

routes.get("/deposits",requireSignin, getDeposits)
routes.get("/users",requireSignin, getUsers)
routes.get("/withdrawals",requireSignin, getWithdrawals)
routes.get("/user/profile",requireSignin, getUserProfile)
routes.get("/profile/:id",requireSignin, getUserProfileById)
routes.post("/balance",requireSignin, updateBalance)

routes.post("/update", requireSignin, updateAdminInfo)
routes.get("/profile", requireSignin, getAdminProfile )
routes.get("/sum", requireSignin, getAllSums)
 
// routes.get("/transactions",requireSignin,getTransactionHistory)
// routes.post("/forgot/password",forgotPassword)
// routes.post("/password/new",verify)
// routes.get("/refferalData",requireSignin,refferalData)
// routes.get("/refferalData2",refferalData2)
// routes.patch("/profile/update/bank",requireSignin,updateBankDetails)
// routes.patch("/profile/update/socials",requireSignin,updateSocialDetails)
// routes.patch("/profile/update/personal",requireSignin,parser,updatePersonalDetails)
// routes.get("/profile/byID/:id",getProfileById)
// routes.patch("/profile/image",requireSignin,parser,uploadProfilePicture)

module.exports=routes