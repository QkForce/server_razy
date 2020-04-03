const express = require('express');
const passport = require('../middlewares/passport');
const userMiddle = require('../middlewares/user.middleware');
const validator = require('../middlewares/distributor_owner.middleware');
const controller = require('../controllers/users/DistributorOwnerController');
const router = express.Router();


//
router.get('/', passport.is(["admin"]), controller.getAll);


router.post('/', validator.create, passport.is(["admin"]), userMiddle.isEmailExist, controller.create);


router.patch('/', passport.is(["distributor"]), controller.update);


router.delete('/:distributor_owner', passport.is(["admin"]), controller.deleteById);


module["exports"] = router;