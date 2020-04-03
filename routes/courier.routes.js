const express = require('express');
const passport = require('../middlewares/passport');
const upload = require('../middlewares/upload');
const controller = require('../controllers/users/CourierControler');
const userMiddle = require('../middlewares/user.middleware');
const router = express.Router();


// token -- distributor
router.get('/', passport.is(["distributor"]), controller.getAll);

// token -- distributor
// email, password
// password
// first_name
// last_name
router.post('/', passport.is(["distributor"]), userMiddle.isEmailExist, controller.create);


router.patch('/', passport.is(["courier"]), upload.single('image'), controller.update);


router.delete('/:courier', passport.is(["distributor"]), controller.deleteById);




module["exports"] =  router;