const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const pageController = require('../controllers/pageController');

router.get('/', pageController.dash);

// // crete, find, update, delete
router.get('/item-catalog', itemController.view);
router.post('/item-catalog', itemController.find);
router.get('/add-item', itemController.form);
router.post('/add-item', itemController.create);
router.get('/edit-item/:id', itemController.edit);
router.post('/edit-item/:id', itemController.update);
router.get('/view-item/:id', itemController.viewall);
router.get('/:id', itemController.delete);

module.exports = router;