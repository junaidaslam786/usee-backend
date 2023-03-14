import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class City extends Model {
    static associate(models) {
      City.belongsTo(models.state, { foreignKey: 'stateId' })
      City.hasMany(models.user, { foreignKey: 'cityId' })
    }
  }

  City.init({
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
  }, {
    modelName: 'city',
    tableName: 'cities',
    sequelize,
    paranoid: false
  });

  City.addHook('beforeSave', async (instance) => {
    //
  });

  City.addHook('afterCreate', (instance) => {
    //
  });

  City.addHook('afterDestroy', (instance) => {
    //
  });

  return City;
}
