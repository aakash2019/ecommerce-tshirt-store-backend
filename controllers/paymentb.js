var braintree = require("braintree");

var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   's3n9ynmn2jp5mbsc',
    publicKey:    'jmrsv35b26kgr5zw',
    privateKey:   '99bc5b964d85cc7a243dd950f9be9073'
});

exports.getToken = (req, res) => {
	gateway.clientToken.generate({}, function (err, response) {
	  if (err) {
	  	res.status(500).send(err)
	  } else {
	  	res.send(response)
	  }
	}); 
};

exports.processPayment = (req, res) => {
	let nonceFromTheClient = req.body.paymentMethodNonce

	let amountFromTheClient = req.body.amount;

	gateway.transaction.sale({
	  amount: amountFromTheClient,
	  paymentMethodNonce: nonceFromTheClient,
	  options: {
	    submitForSettlement: true
	  }
	}, function (err, result) {
		if (err) {
			res.status(500).json(err)
		} else {
			res.json(result)
		}
	}); 
};