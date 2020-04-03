const express = require('express');
const passport = require('../middlewares/passport');
const controller = require('../controllers/dev/FakerController');
const router = express.Router();


router.post('/finished_routes', passport.is(["admin"]), controller.generateFinishedRoutes);


router.post('/create/route_with_orders', passport.is(["admin"]), controller.createRouteWithOrders);


router.delete('/delete/route_with_orders', passport.is(["admin"]), controller.deleteRouteWithOrders);


module["exports"] = router;