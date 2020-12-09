require('dotenv').config();

const stripe = require('stripe')("sk_test_51GuuOrJwxv4L2d214SutGXVrqri6xe6nFro7PiYoL7vgBZf9ZbTgz7AbLW0fG8TX92eV2qj6IhkK5b1AA3ZwCGer00UUcuvcG4");
const uuid = require('uuid/v4');

exports.makePayment = (req, res) => {
	const { products, token } = req.body;
	console.log("PRODUCTS: ", products)
	console.log("TOKEN: ", token)

	let amount = 0;
	products.map(p => {
		amount = amount + p.price
	});

	const idempotencyKey = uuid()

	return stripe.customers
		.create({
			email: token.email,
			source: token.id,
		})
		.then(customer => {
			stripe.charges
				.create({
					amount: amount * 100,
					currency: 'usd',
					customer: customer.id,
					receipt_email: token.email,
					description: "A test account",
					shipping: {
						name: token.card.name,
						address: {
							line1: token.card.address_line1,
							line2: token.card.address_line2,
							city: token.card.address_city,
							country: token.card.address_country,
							postal_code: token.card.address_zip

						}
					}
				}, {idempotencyKey})
				.then(result => res.status(200).json(result))
				.catch(err => console.log(err))
		})

};
