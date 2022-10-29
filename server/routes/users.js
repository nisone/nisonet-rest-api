const express = require('express');
const {
    setUserBio,
    setUserQualification, 
    setUserSkills, 
    updateUserBio, 
    updateUserQualification, 
    updateUserSkill
} = require('../controllers/users.js');

const router = express.Router();

router.post('/bio', setUserBio);
router.patch('/bio/:id', updateUserBio);
router.post('/qualification', setUserQualification);
router.patch('/qualification', updateUserQualification);
router.post('/skill', setUserSkills);
router.patch('/skill', updateUserSkill);

module.exports = router;