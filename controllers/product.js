const Product = require('../models/product');
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');

// Get a Product's productId
exports.getProductById = (req, res, next, id) => {
	Product.findById(id)
		.populate('category')
		.exec((err, product) => {
			if (err) {
				return res.status(400).json({
					error: ""
				});
			};
			req.product = product;
			next();
		});
};

// Creates a Product
exports.createProduct = (req, res) => {

	// Form starts from here
	let form = new formidable.IncomingForm();
	form.keepExtension = true;

	form.parse(req, (err, fields, file) => {
		if (err) {
			return res.status(400).json({
				error: "Problem with Image"
			});
		};

		const { name, description, price, category, stock } = fields;

		if (
			!name ||
			!description ||
			!price ||
			!category ||
			!stock	
		) {
			return res.status(400).json({
				error: "Please include all the fields"
			})
		}
		
		let product = new Product(fields);

		// Handle files here
		if (file.photo) {
			if (file.photo.size > 3000000) {
				return res.status(400).json({
					error: "File size too big"
				});
			};
			product.photo.data = fs.readFileSync(file.photo.path);
			product.photo.contentType = file.photo.type;
		};

		// Save to the DB
		product.save((err, product) => {
			if (err) {
				return res.status(400).json({
					error: "Saving tshirt in DB failed"
				});
			};
			res.json(product);
		});
	});
};

// Get a product
exports.getProduct = (req, res) => {
	req.product.photo = undefined;
	return res.json(req.product);
};

// Middleware for photos
exports.photo = (req, res, next) => {
	if (req.product.photo.data) {
		res.set("COntent-Type", req.product.photo.contentType);
		return res.send((req.product.photo.data));
	}
	next();
};

// Delete a Product
exports.deleteProduct = (req, res) => {
	let product = req.product;

	product.remove((err, deletedProduct) => {
		if (err) {
			return res.status(400).json({
				error: "Failed to delete the product"
			});
		}
		res.json({
			message: "Deletion was a success",
			deletedProduct
		});
	})
};

// Update a product
exports.updateProduct = (req, res) => {
	// Form starts from here
	let form = new formidable.IncomingForm();
	form.keepExtension = true;

	form.parse(req, (err, fields, file) => {
		if (err) {
			return res.status(400).json({
				error: "Problem with Image"
			});
		};

		// Updation code
		let product = req.product;
		product = _.extend(product, fields);

		// Handle files here
		if (file.photo) {
			if (file.photo.size > 3000000) {
				return res.status(400).json({
					error: "File size too big"
				});
			};
			product.photo.data = fs.readFileSync(file.photo.path);
			product.photo.contentType = file.photo.type;
		};

		// Save to the DB
		product.save((err, product) => {
			if (err) {
				return res.status(400).json({
					error: "Updation of product failed"
				});
			};
			res.json(product);
		});
	});
};

// Products listing
exports.getAllProducts = (req, res) => {
	// Setting defaults
	let limit = req.query.limit ? parseInt(req.query.limit) : 8;
	let sortBy = req.query.sortBy ? parseInt(req.query.sortBy) : "_id";

	Product.find()
		.select('-photo')
		.populate('category')
		.sort([[sortBy, "asc"]])
		.limit(limit)
		.exec((err, products) => {
			if (err) {
				return res.status(400).json({
					error: "No product found"
				});
			}
			res.json(products);
		});
};

// Category listing
exports.getAllUniqueCategories = (req, res) => {
	Product.distinct('category', {}, (err, category) => {
		if (err) {
			return res.status(400).json({
				error: "No category found"
			});
		}
		res.json(category);
	})
}

// Updates the stock --> Middleware
exports.updateStock = (req, res, next) => {
	let myOperations = req.body.order.products.map(prod => {
		return {
			updateOne: {
				filter: {_id: prod._id},
				update: {$inc: {stock: -prod.count, sold: +prod.count}}
			}
		}
	});

	Product.bulkWrite(myOperations, {}, (err, products) => {
		if (err) {
			return res.status(400).json({
				error: "Bulk operation failed"
			});
		};
		next();
	})
};