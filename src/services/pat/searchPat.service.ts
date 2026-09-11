import Pat from "../../models/pat";
import { AppUser } from "../../models/app_user";
import PatDrugAllergy from "../../models/pat_drugallergy";
import bcrypt from "bcryptjs";

export class SearchPatService {
  static async searchPat(citizencardno: string) {
    if (!citizencardno) {
      throw new Error("citizencardno is required");
    }

    // First check AppUser (manual registrations or updated profiles)
    const appUser = await AppUser.findOne({ where: { citizencardno } });
    if (appUser) {
      return {
        id: appUser.id,
        firstname: appUser.firstname,
        lastname: appUser.lastname,
        sex: appUser.sex,
        age: appUser.age,
        phone: appUser.phone,
        citizencardno: appUser.citizencardno,
        has_password: !!appUser.password,
        source: 'app'
      };
    }

    // Fallback to hospital db
    const patRecord = await Pat.findOne({
      where: { citizencardno },
      attributes: [
        "hn",
        "prename",
        "firstname",
        "lastname",
        "sex",
        "citizencardno",
        "birthdatetime",
      ],
    });

    if (!patRecord) {
      return null;
    }

    const patJson = patRecord.toJSON() as any;

    let age = 0;
    if (patJson.birthdatetime) {
      const birthDate = new Date(patJson.birthdatetime);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    let sexString = "ไม่ระบุ";
    if (patJson.sex === 1) sexString = "ชาย";
    else if (patJson.sex === 2) sexString = "หญิง";

    let birthDateStr = '';
    if (patJson.birthdatetime) {
        birthDateStr = new Date(patJson.birthdatetime).toISOString().split('T')[0];
    } else {
        birthDateStr = '2000-01-01'; // Fallback
    }

    return {
      hn: patJson.hn,
      prename: patJson.prename,
      firstname: patJson.firstname,
      lastname: patJson.lastname,
      sex: sexString,
      age: age,
      birthDate: birthDateStr,
      citizencardno: patJson.citizencardno,
      has_password: false,
      source: 'hosp'
    };
  }

  static async saveAppUser(data: any) {
    const { citizencardno, firstname, lastname, sex, birthDate, age, phone, password } = data;
    
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Upsert user
    let user = await AppUser.findOne({ where: { citizencardno } });
    if (user) {
      const updateData: any = { firstname, lastname, sex, birthDate, age, phone };
      if (hashedPassword) updateData.password = hashedPassword;
      await user.update(updateData);
    } else {
      let drug_allergies = '[]';
      let food_allergies = '[]';

      // Pull from hospital DB if user exists there
      const patRecord = await Pat.findOne({ where: { citizencardno }, attributes: ['hn'] });
      if (patRecord) {
        const hn = patRecord.getDataValue('hn');
        const allergies = await PatDrugAllergy.findAll({ where: { hn, flag_active: 'Y' } });
        
        const d_arr = allergies.filter(a => a.flag_type === 'A').map(a => `${a.alertdrug} ${a.detailtext ? `(${a.detailtext})` : ''}`.trim());
        const f_arr = allergies.filter(a => a.flag_type === 'C').map(a => `${a.alertdrug} ${a.detailtext ? `(${a.detailtext})` : ''}`.trim());
        
        drug_allergies = JSON.stringify(d_arr);
        food_allergies = JSON.stringify(f_arr);
      }

      user = await AppUser.create({ 
        citizencardno, firstname, lastname, sex, birthDate, age, phone, password: hashedPassword,
        drug_allergies, food_allergies
      });
    }
    
    return {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      sex: user.sex,
      age: user.age,
      phone: user.phone,
      citizencardno: user.citizencardno,
      has_password: !!user.password,
      source: 'app'
    };
  }

  static async login(citizencardno: string, passwordInput: string) {
    const appUser = await AppUser.findOne({ where: { citizencardno } });
    if (!appUser) {
      throw new Error("User not found");
    }
    
    if (!appUser.password) {
      throw new Error("Invalid password");
    }

    const isMatch = await bcrypt.compare(passwordInput, appUser.password);
    if (!isMatch) {
      // For backward compatibility (if the user already has plaintext password from before we added bcrypt)
      if (appUser.password === passwordInput) {
        // Hash it and update
        const hashed = await bcrypt.hash(passwordInput, 10);
        await appUser.update({ password: hashed });
      } else {
        throw new Error("Invalid password");
      }
    }

    return {
      id: appUser.id,
      firstname: appUser.firstname,
      lastname: appUser.lastname,
      sex: appUser.sex,
      age: appUser.age,
      phone: appUser.phone,
      citizencardno: appUser.citizencardno,
      has_password: true,
      source: 'app'
    };
  }
}
