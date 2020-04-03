const express = require('express');
const passport = require('../middlewares/passport');
const upload = require('../middlewares/upload');
const controller = require('../controllers/ProductController');
const router = express.Router();



router.get('/my', passport.is(["distributor"]), controller.getDistributorProducts);

router.get('/client/:distributor', passport.is(["client"]), controller.getClientProducts);


router.post('/', passport.is(["distributor"]), upload.single('image'), controller.create);


router.patch('/:product', passport.is(["distributor"]), upload.single('image'), controller.updateById);


router.delete('/:product', passport.is(["distributor"]), controller.deleteById);





module["exports"] =  router;