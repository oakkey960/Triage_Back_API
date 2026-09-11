import { Model, DataTypes } from 'sequelize';
import { sequelizeApp as sequelize } from './index';

export class AppTriageHistory extends Model {
  public id!: number;
  public citizencardno!: string;
  public chief_complaint!: string;
  public severity!: string;
  public destination!: string;
  public reason!: string;
  public nurse_response!: string;
  public is_emergency!: boolean;
  public latitude!: number;
  public longitude!: number;
  public image_data!: Buffer;
  public image_mime_type!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AppTriageHistory.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  citizencardno: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  chief_complaint: { type: DataTypes.TEXT, allowNull: true },
  severity: { type: DataTypes.STRING(20), allowNull: false },
  destination: { type: DataTypes.STRING(150), allowNull: false },
  reason: { type: DataTypes.TEXT, allowNull: false },
  nurse_response: { type: DataTypes.TEXT, allowNull: false },
  is_emergency: { type: DataTypes.BOOLEAN, allowNull: false },
  latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
  longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },
  image_data: { type: DataTypes.BLOB('long'), allowNull: true },
  image_mime_type: { type: DataTypes.STRING(50), allowNull: true },
}, {
  sequelize,
  tableName: 'app_triage_history',
  timestamps: true,
});
