import { Router } from 'express';
import { getPatientInfo, saveUser, getHealthInfo, updateHealthInfo, loginUser, updateProfile, changePassword, getHospAllergies } from '../controllers/pat.controller';

const router = Router();

router.post('/search', getPatientInfo);
router.post('/login', loginUser);
router.post('/save', saveUser);
router.get('/health/:cid', getHealthInfo);
router.put('/health/:cid', updateHealthInfo);
router.put('/profile/:cid', updateProfile);
router.put('/password/:cid', changePassword);
router.get('/hosp-allergy/:cid', getHospAllergies);

export default router;
