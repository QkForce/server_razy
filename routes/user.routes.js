const express = require('express');
const passport = require('../middlewares/passport');
const controller = require('../controllers/users/UserController');
const router = express.Router();



//************************ CHANGE PASSWORD **********************************
router.patch('/password/admin', passport.is(["admin"]), controller.changePasswordAdmin);
router.patch('/password/distributor_owner', passport.is(["distributor_owner"]), controller.changePasswordDistributorOwner);
router.patch('/password/distributor', passport.is(["distributor"]), controller.changePasswordDistributor);
router.patch('/password/courier', passport.is(["courier"]), controller.changePasswordCourier);
router.patch('/password/client', passport.is(["client"]), controller.changePasswordClient);





//************************ GET PROFILE **********************************
router.get('/profile', passport.is(["admin", "distributor_owner", "distributor", "courier", "client"]), controller.getProfile);




module["exports"] =  router;