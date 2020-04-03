const express = require('express');
const passport = require('../middlewares/passport');
const upload = require('../middlewares/upload');
const userMiddle = require('../middlewares/user.middleware');
const controller = require('../controllers/users/AdminController');
const router = express.Router();





router.get('/', passport.is(["admin"]), controller.getAll);


router.post('/', userMiddle.isEmailExist, controller.create);


router.patch('/', passport.is(["admin"]), upload.single('image'), controller.update);


router.delete('/', passport.is(["admin"]), controller.delete);





module["exports"] =  router;