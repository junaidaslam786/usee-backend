import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class Country extends Model {
    static associate(models) {
      Country.hasMany(models.state, { foreignKey: 'countryId' });
    }
  }

  Country.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sortname: {
      type: DataTypes.STRING,
    },
    phonecode: {
      type: DataTypes.INTEGER,
    },
  }, {
    modelName: 'country',
    tableName: 'countries',
    sequelize,
  });

  Country.addHook('beforeSave', async (instance) => {
    //
  });

  Country.addHook('afterCreate', (instance) => {
    //
  });

  Country.addHook('afterDestroy', (instance) => {
    //
  });

  return Country;
}
