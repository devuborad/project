const express = require('express');
const router = express.Router();
const { getClubs, createClub, joinClub, getClubMembers, updateMemberRole, approveClubMember, getOverview } = require('../controllers/clubController');
const { verifyToken, authorizeRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(verifyToken);

router.get('/', getClubs);
router.post('/', authorizeRole('admin', 'club_admin'), upload.single('logo'), createClub);
router.post('/join', authorizeRole('student'), joinClub);

router.get('/overview', authorizeRole('club_admin'), getOverview);
router.get('/members', authorizeRole('club_admin'), getClubMembers);
router.put('/members/:student_id/role', authorizeRole('club_admin'), updateMemberRole);
router.put('/members/:student_id/approve', authorizeRole('club_admin'), approveClubMember);

module.exports = router;
