const express = require('express');
const router = express.Router();

const auth = require('../middleware/authRoute');
const authValidator = require('../validators/authValidator');
const userValidator = require('../validators/userValidator');

const authController = require('../controllers/authController');
const adsController = require('../controllers/adsController');
const userController = require('../controllers/userController');


router.get('/ping', (req, res) => {
    res.json({ pong: true });
})

router.get('/states', userController.getState);

router.post('/user/singin', authValidator.signin, authController.signin);
router.post('/user/singup', authValidator.signup, authController.signup);


router.get('/user/me', auth.private, userController.info);
router.put('/user/me', userValidator.editAction, auth.private, userController.editAction);

router.get('/categories', adsController.getCategories);
router.post('/ad/add', auth.private, adsController.addAction);
router.get('/ad/list', adsController.getList);
router.get('/ad/item', adsController.getItem);
router.post('/ad/:id', auth.private, adsController.editAction);


module.exports = router;
