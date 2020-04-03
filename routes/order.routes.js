const express = require('express');
const passport = require('../middlewares/passport');
const controller = require('../controllers/OrderController');
const validator = require('../middlewares/order.middleware');
const router = express.Router();


router.get('/new', passport.is(["distributor"]), controller.getNewOrders);


// token -- client
router.get('/client/active', passport.is(["client"]), controller.getClientUnperformedOrders);

// distributor -- token
// client
// list {name, count1}
// start
router.post('/', passport.is(["distributor"]), validator.create, controller.createOrderDistributor);

// client -- token
// distributor
// list {name, count1}
// start
router.post('/createByClient', passport.is(["client"]), validator.create, controller.createOrderClient);

// order
router.patch('/', passport.is(["distributor"]), validator.update, controller.update);

// courier -- token
// order
// list
router.patch('/courier/finish', passport.is(["courier"]), controller.sendFinishAgreement);

// client -- token
// order
router.patch('/client/finish', passport.is(["client"]), controller.confirmFinish);

// client -- token
// order
router.patch('/client/cancel', passport.is(["client"]), controller.cancelClient);

// token -- distributor
router.delete('/:order', passport.is(["distributor"]), controller.deleteById);


module["exports"] = router;