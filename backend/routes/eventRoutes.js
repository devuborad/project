const express = require('express');
const router = express.Router();
const { getEvents, createEvent, deleteEvent } = require('../controllers/eventController');
const { verifyToken, authorizeRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getEvents);
router.post('/', authorizeRole('club_admin'), createEvent);
router.delete('/:id', authorizeRole('club_admin'), deleteEvent);

module.exports = router;
