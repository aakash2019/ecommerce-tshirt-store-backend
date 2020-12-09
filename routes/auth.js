const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { signout, signup, signin, isSignedIn } = require('../controllers/auth')

router.post(
	'/signup', 
	[
		check('name', 'Name should be atleast 3 char').isLength({ min: 3 }),
		check('email', 'Must be an email').isEmail(),
		check('password', 'Password should be atleast 3 char').isLength({ min: 3 })
	],
	signup
);

router.post(
	'/signin', 
	[
		check('email', 'Email is required').isEmail(),
		check('password', 'Password is required').isLength({ min: 3 })
	],
	signin
);

router.get('/signout', signout);

module.exports = router;