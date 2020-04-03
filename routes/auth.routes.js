const express = require('express');
const controller = require('../controllers/users/AuthController');
const router = express.Router();
const passport = require('../middlewares/passport');





// localhost:5000/api/auth/login/admin
//************************ LOGIN ***************************************
router.post('/login/admin', controller.loginAdmin);
router.post('/login/distributor_owner', controller.loginDistributorOwner);
router.post('/login/distributor', controller.loginDistributor);
router.post('/login/courier', controller.loginCourier);
router.post('/login/client', controller.loginClient);



//************************ LOGOUT **************************************
router.post('/logout/admin', passport.is(["admin"]), controller.logoutAdmin);
router.post('/logout/distributor_owner', passport.is(["distributor_owner"]), controller.logoutDistributorOwner);
router.post('/logout/distributor', passport.is(["distributor"]), controller.logoutDistributor);
router.post('/logout/courier', passport.is(["courier"]), controller.logoutCourier);
router.post('/logout/client', passport.is(["client"]), controller.logoutClient);



//************************ LOGOUT ALL **********************************
router.post('/logoutAll/admin', passport.is(["admin"]), controller.logoutAllAdmin);
router.post('/logoutAll/distributor_owner', passport.is(["distributor_owner"]), controller.logoutAllDistributorOwner);
router.post('/logoutAll/distributor', passport.is(["distributor"]), controller.logoutAllDistributor);
router.post('/logoutAll/courier', passport.is(["courier"]), controller.logoutAllCourier);
router.post('/logoutAll/client', passport.is(["client"]), controller.logoutAllClient);







module["exports"] =  router;