const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// // crete, find, update, delete
router.get('/', itemController.view);
router.post('/', itemController.find);
router.get('/add-item', itemController.form);
router.post('/add-item', itemController.create);
router.get('/edit-item/:id', itemController.edit);
router.post('/edit-item/:id', itemController.update);
router.get('/view-item/:id', itemController.viewall);
router.get('/:id', itemController.delete);

module.exports = router;