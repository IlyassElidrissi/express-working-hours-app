const express = require('express');
const taskController = require('../controllers/taskController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
