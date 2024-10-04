const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');

router.get('/', homeController.home_get);
router.post('/login', homeController.login_post);
router.post('/signup', homeController.signup_post);
router.get('/logout', homeController.logout_get);

module.exports = router;