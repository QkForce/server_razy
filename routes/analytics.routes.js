const express = require('express');
const passport = require('../middlewares/passport');
const controller = require('../controllers/AnalyticsController');
const validator = require('../middlewares/analytics.middleware');
const router = express.Router();





router.get('/do/distributors_orders', passport.is(["distributor_owner"]), validator.distributorsOrders, controller.distributorsOrders);
router.get('/dm/distributor_orders', passport.is(["distributor"]), controller.distributorOrders);



router.get('/do/client_orders', passport.is(["distributor_owner"]), controller.clientOrdersForDistributorOwner);  
router.get('/dm/client_orders', passport.is(["distributor"]), controller.clientOrdersForDistributor);  



router.get('/do/courier_orders_counts', passport.is(["distributor_owner"]), controller.courierOrdersForDistributorOwner);
router.get('/dm/courier_orders_counts', passport.is(["distributor"]), controller.courierOrdersForDistributor);





module["exports"] = router;