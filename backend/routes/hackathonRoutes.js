const express = require('express');
const router = express.Router();
const { getHackathons, createHackathon, deleteHackathon } = require('../controllers/hackathonController');
const { verifyToken, authorizeRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getHackathons);
router.post('/', authorizeRole('club_admin'), createHackathon);
router.delete('/:id', authorizeRole('club_admin'), deleteHackathon);

module.exports = router;
