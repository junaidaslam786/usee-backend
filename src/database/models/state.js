import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class State extends Model {
    static associate(models) {
      State.belongsTo(models.country, { foreignKey: 'countryId' });
      State.hasMany(models.city, { foreignKey: 'stateId' });
    }
  }

  State.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
    countryId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'countries',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    modelName: 'state',
    tableName: 'states',
    sequelize,
  });

  State.addHook('beforeSave', async (instance) => {
    //
  });

  State.addHook('afterCreate', (instance) => {
    //
  });

  State.addHook('afterDestroy', (instance) => {
    //
  });

  return State;
}
