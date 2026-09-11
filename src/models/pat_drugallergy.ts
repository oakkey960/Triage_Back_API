import { Model, DataTypes } from 'sequelize';
import { sequelizePPK as sequelize } from './index';

export class PatDrugAllergy extends Model {
  public id!: number;
  public hn!: number;
  public detailtext!: string;
  public alertdrug!: string;
  public flag_active!: string;
  public flag_type!: string;
}

PatDrugAllergy.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hn: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    detailtext: {
      type: DataTypes.STRING(400),
      allowNull: true,
    },
    alertdrug: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    flag_active: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    flag_type: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'pat_drugallergy',
    timestamps: false,
  }
);

export default PatDrugAllergy;
