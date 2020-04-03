const express = require('express');
const controller = require('../controllers/users/ClientController');
const middleware = require('../middlewares/client.middleware');
const userMiddle = require('../middlewares/user.middleware');
const passport = require('../middlewares/passport');
const upload = require('../middlewares/upload');
const router = express.Router();



router.get('/', passport.is(["distributor"]), middleware.getAllByDistributorId, controller.getAllByDistributorId);


router.get('/my_distributors', passport.is(["client"]), controller.getMyDistributors);


router.post('/exist', passport.is(["admin", "distributor"]), controller.isExist);


router.get('/my/others/:bin', passport.is(["client"]), controller.getOthers);


router.post('/', passport.is(["distributor"]), controller.create);


router.patch('/', passport.is(["client"]), upload.single('image'), controller.update);


router.patch('/recover', controller.recover);


router.patch('/subscribe', passport.is(["distributor"]), controller.subscribeDistributor);


router.patch('/unsubscribe', passport.is(["distributor"]), controller.unsubscribeDistributor);


router.delete('/:client', passport.is(["client"]), controller.deleteById);





module["exports"] = router;