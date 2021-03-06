const express = require('express');
const router = express.Router();

const { 
	getOrderById, 
	createOrder,
	getAllOrders,
	updateStatus,
	getOrderStatus 
} =  require('../controllers/order');

const { isSignedIn, isAuthenticated, isAdmin } = require('../controllers/auth');
const { getUserById, pushOrderInPurchaseList } = require('../controllers/user');
const { updateStock } =  require('../controllers/product');

// Params
router.param('userId', getUserById);
router.param('orderId', getOrderById);

// Actual routes

// Create route
router.post(
	'/order/create/:userId', 
	isSignedIn, 
	isAuthenticated, 
	pushOrderInPurchaseList,
	updateStock, 
	createOrder
);

// Read route
router.get(
	'/order/all/:userId', 
	isSignedIn, 
	isAuthenticated, 
	isAdmin, 
	getOrderStatus
);

// Status of order
router.get(
	'/order/status/:userId', 
	isSignedIn, 
	isAuthenticated, 
	isAdmin,
	getOrderStatus
);
router.put(
	'/order/:orderId/status/:userId', 
	isSignedIn, 
	isAuthenticated, 
	isAdmin, 
	updateStatus
);

module.exports = router;