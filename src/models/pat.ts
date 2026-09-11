import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelizePPK as sequelize } from "./index"; // ✨ แก้จุดนี้: ให้ดึงอินสแตนซ์มาจากศูนย์กลาง index.ts ในโฟลเดอร์เดียวกัน

// 1. สร้าง Class โดยใช้ InferAttributes เพื่อให้ดึง Type ไปใช้ได้อัตโนมัติ
class Pat extends Model<InferAttributes<Pat>, InferCreationAttributes<Pat>> {
  declare hn: CreationOptional<number>;
  declare prename: string;
  declare firstname: CreationOptional<string>;
  declare lastname: CreationOptional<string>;
  declare sex: CreationOptional<number>;
  declare citizencardno: CreationOptional<string>;
  declare birthdatetime: string | null;

  // 📝 เพิ่มช่องสำหรับทำความสัมพันธ์ (Associations) รองรับระบบใน index.ts v6
  static associate(models: any) {
    //
  }
}

// 2. กำหนดโครงสร้างคอลัมน์ (Schema) ของตาราง
Pat.init(
  {
    hn: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    prename: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    firstname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    sex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    citizencardno: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    birthdatetime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize, // ใช้ตัวแปรอินสแตนซ์ที่ดึงมาจาก index.ts
    tableName: "pat",
    timestamps: false,
  },
);

export default Pat;
