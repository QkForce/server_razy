const express = require('express');
const router = express.Router();
const passport = require('../middlewares/passport');
const controller = require('../controllers/ArcGisController');



router.post('/compute', passport.is(['distributor']), controller.compute);





module["exports"] = router;

