const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const pageController = require('../controllers/pageController');
const softwareController = require('../controllers/softwareController');

router.get('/', pageController.dash);
router.get('/settingsPage', pageController.settingsPage);

// // crete, find, update, delete
router.get('/item-catalog', itemController.view);
router.get('/software-catalog', softwareController.view);
router.post('/item-catalog', itemController.find);
router.post('/software-catalog', softwareController.find);
router.get('/add-item', itemController.form);
router.get('/add-software', softwareController.form);
router.post('/add-item', itemController.create);
router.post('/add-software', softwareController.create);
router.get('/edit-item/:id', itemController.edit);
router.get('/edit-software/:id', softwareController.edit);
router.post('/edit-item/:id', itemController.update);
router.post('/edit-software/:id', softwareController.update);
router.get('/view-item/:id', itemController.viewall);
router.get('/view-software/:id', softwareController.viewall);
router.get('/itemdel/:id', itemController.delete);
router.get('/softwaredel/:id', softwareController.delete);
router.post('/update-software/:id', softwareController.update);
router.post('/update-item/:id', itemController.update);

module.exports = router;