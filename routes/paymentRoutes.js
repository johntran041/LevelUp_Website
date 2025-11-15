const router = require('express').Router();

const { renderCheckoutPage, renderConfirmationPage, renderAddCoin, createPaymentIntent, useCoin, updateUserCoin  } = require('../controllers/paymentController.js');

router.get('/checkout', renderCheckoutPage);
router.get('/confirmation', renderConfirmationPage);
router.get('/addcoin', renderAddCoin); 
router.post('/create-payment-intent', createPaymentIntent);
router.post('/use-coin', useCoin); 
router.post('/update-coin', updateUserCoin);


module.exports = router;