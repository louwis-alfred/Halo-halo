import express from 'express'
import adminAuth from '../middleware/adminAuth.js'
import {placeOrder, allOrders, userOrders, updateStatus} from '../controllers/orderController.js'
import { authUser } from '../middleware/authRoles.js'

const orderRouter = express.Router()

// Admin Features
orderRouter.post('/list', adminAuth,allOrders)
orderRouter.post('/status', adminAuth,updateStatus)

// Payment Features
orderRouter.post('/place', authUser,placeOrder)

// User Feature
orderRouter.get('/userorders', authUser, userOrders);

export default orderRouter