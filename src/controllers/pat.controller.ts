import { Request, Response } from 'express';
import { SearchPatService } from '../services/pat/searchPat.service';
import { AppUser } from '../models/app_user';

export const getPatientInfo = async (req: Request, res: Response) => {
  try {
    const { cid } = req.body;
    if (!cid) {
      return res.status(400).json({ status: 'error', message: 'cid is required' });
    }
    const patient = await SearchPatService.searchPat(cid);
    if (!patient) {
      return res.status(404).json({ status: 'error', message: 'Patient not found' });
    }
    return res.status(200).json({ status: 'success', data: patient });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const saveUser = async (req: Request, res: Response) => {
  try {
    const user = await SearchPatService.saveAppUser(req.body);
    return res.status(200).json({ status: 'success', data: user });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { cid, password } = req.body;
    if (!cid || !password) {
      return res.status(400).json({ status: 'error', message: 'cid and password are required' });
    }
    const user = await SearchPatService.login(cid, password);
    return res.status(200).json({ status: 'success', data: user });
  } catch (error: any) {
    console.error(error);
    if (error.message === 'Invalid password') {
      return res.status(401).json({ status: 'error', message: 'รหัสผ่านไม่ถูกต้อง' });
    }
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getHealthInfo = async (req: Request, res: Response) => {
  try {
    const { cid } = req.params;
    if (!cid) {
      return res.status(400).json({ status: 'error', message: 'cid is required' });
    }
    const user = await AppUser.findOne({ where: { citizencardno: cid } });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    return res.status(200).json({
      status: 'success',
      data: {
        id: user.id,
        citizencardno: user.citizencardno,
        firstname: user.firstname,
        lastname: user.lastname,
        sex: user.sex,
        birthDate: user.birthDate,
        age: user.age,
        phone: user.phone,
        weight: user.weight || '-',
        height: user.height || '-',
        drug_allergies: JSON.parse(user.drug_allergies || '[]'),
        food_allergies: JSON.parse(user.food_allergies || '[]'),
        chronic_diseases: JSON.parse(user.chronic_diseases || '[]'),
        regular_medications: JSON.parse(user.regular_medications || '[]'),
      }
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateHealthInfo = async (req: Request, res: Response) => {
  try {
    const { cid } = req.params;
    const { drug_allergies, food_allergies, chronic_diseases, regular_medications, phone, weight, height } = req.body;

    const user = await AppUser.findOne({ where: { citizencardno: cid } });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const updateData: any = {};
    if (drug_allergies !== undefined) updateData.drug_allergies = JSON.stringify(drug_allergies);
    if (food_allergies !== undefined) updateData.food_allergies = JSON.stringify(food_allergies);
    if (chronic_diseases !== undefined) updateData.chronic_diseases = JSON.stringify(chronic_diseases);
    if (regular_medications !== undefined) updateData.regular_medications = JSON.stringify(regular_medications);
    if (phone !== undefined) updateData.phone = phone;
    if (weight !== undefined) updateData.weight = weight;
    if (height !== undefined) updateData.height = height;

    await user.update(updateData);

    return res.status(200).json({
      status: 'success',
      data: {
        drug_allergies: JSON.parse(user.drug_allergies || '[]'),
        food_allergies: JSON.parse(user.food_allergies || '[]'),
        chronic_diseases: JSON.parse(user.chronic_diseases || '[]'),
        regular_medications: JSON.parse(user.regular_medications || '[]'),
        phone: user.phone,
        weight: user.weight,
        height: user.height,
      }
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

import bcrypt from 'bcryptjs';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { cid } = req.params;
    const { firstname, lastname, phone } = req.body;
    
    const user = await AppUser.findOne({ where: { citizencardno: cid } });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    await user.update({ firstname, lastname, phone });
    return res.status(200).json({ status: 'success', data: { firstname: user.firstname, lastname: user.lastname, phone: user.phone } });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { cid } = req.params;
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ status: 'error', message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const user = await AppUser.findOne({ where: { citizencardno: cid } });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'ไม่พบผู้ใช้งาน' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch && user.password !== oldPassword) {
      return res.status(400).json({ status: 'error', message: 'รหัสผ่านเดิมไม่ถูกต้อง' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashed });

    return res.status(200).json({ status: 'success', message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

import Pat from '../models/pat';
import PatDrugAllergy from '../models/pat_drugallergy';

export const getHospAllergies = async (req: Request, res: Response) => {
  try {
    const { cid } = req.params;
    
    // Find patient in Pat db to get their HN
    const patRecord = await Pat.findOne({ where: { citizencardno: cid }, attributes: ['hn'] });
    if (!patRecord) {
      return res.status(404).json({ status: 'error', message: 'Patient not found in hospital DB' });
    }

    const hn = patRecord.getDataValue('hn');

    // Find allergies for this HN where flag_active = 'Y'
    const allergies = await PatDrugAllergy.findAll({
      where: { hn, flag_active: 'Y' }
    });

    const drug_allergies = allergies
      .filter(a => a.flag_type === 'A')
      .map(a => `${a.alertdrug} ${a.detailtext ? `(${a.detailtext})` : ''}`.trim());

    const food_allergies = allergies
      .filter(a => a.flag_type === 'C')
      .map(a => `${a.alertdrug} ${a.detailtext ? `(${a.detailtext})` : ''}`.trim());

    return res.status(200).json({
      status: 'success',
      data: {
        drug_allergies,
        food_allergies
      }
    });

  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
