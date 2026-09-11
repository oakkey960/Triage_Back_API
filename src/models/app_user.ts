import { Model, DataTypes } from 'sequelize';
import { sequelizeApp as sequelize } from './index';

export class AppUser extends Model {
  public id!: number;
  public citizencardno!: string;
  public firstname!: string;
  public lastname!: string;
  public sex!: string;
  public birthDate!: string;
  public age!: number;
  public phone!: string;
  public password!: string;
  public weight!: string;
  public height!: string;
  public drug_allergies!: string;
  public food_allergies!: string;
  public chronic_diseases!: string;
  public regular_medications!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AppUser.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  citizencardno: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
  },
  firstname: { type: DataTypes.STRING(100), allowNull: false },
  lastname: { type: DataTypes.STRING(100), allowNull: false },
  sex: { type: DataTypes.STRING(20), allowNull: false },
  birthDate: { type: DataTypes.STRING(50), allowNull: false },
  age: { type: DataTypes.INTEGER, allowNull: false },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  password: { type: DataTypes.STRING(255), allowNull: true },
  weight: { type: DataTypes.STRING(10), allowNull: true },
  height: { type: DataTypes.STRING(10), allowNull: true },
  drug_allergies: { type: DataTypes.TEXT, allowNull: true, defaultValue: '[]' },
  food_allergies: { type: DataTypes.TEXT, allowNull: true, defaultValue: '[]' },
  chronic_diseases: { type: DataTypes.TEXT, allowNull: true, defaultValue: '[]' },
  regular_medications: { type: DataTypes.TEXT, allowNull: true, defaultValue: '[]' },
}, {
  sequelize,
  tableName: 'app_users',
  timestamps: true,
});
