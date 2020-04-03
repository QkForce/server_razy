const express = require('express');
const passport = require('../middlewares/passport');
const userMiddle = require('../middlewares/user.middleware');
const upload = require('../middlewares/upload');
const controller = require('../controllers/users/DistributorController');
const router = express.Router();



// MainAdmin and DistAdmin
router.get('/:distributor_owner', passport.is(["admin", "distributor_owner"]), controller.getAll);


router.post('/', passport.is(["admin"]), userMiddle.isEmailExist, controller.create);


router.patch('/', passport.is(["distributor"]), upload.single('image'), controller.update);


router.delete('/:distributor', passport.is(["admin"]), controller.deleteById);





module["exports"] =  router;