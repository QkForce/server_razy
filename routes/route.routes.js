const express = require('express');
const passport = require('../middlewares/passport');
const controller = require('../controllers/RouteController');
const router = express.Router();
const validator = require('../middlewares/route.middleware');



router.get('/new', passport.is(["distributor"]), controller.getNewRoutes);


router.get('/courier', passport.is(["courier"]), controller.getCourierRoute);


router.post('/createRoutes', passport.is(["distributor"]), validator.createMany, controller.createMany);


router.patch('/activate/:route', passport.is(["distributor"]), validator.activate, controller.activate);


router.patch('/finish/:route', passport.is(["distributor"]), validator.finish, controller.finish);


router.delete('/:date', passport.is(["distributor"]), controller.deleteByDate);





module["exports"] = router;