import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class CustomerLog extends Model {
    static associate(models) {
        CustomerLog.belongsTo(models.user, { foreignKey: 'userId' });
    }
  }

  CustomerLog.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING,
    },
  }, {
    modelName: 'customerLog',
    tableName: 'customer_logs',
    sequelize,
  });

  CustomerLog.addHook('beforeSave', async (instance) => {
    //
  });

  CustomerLog.addHook('afterCreate', (instance) => {
    //
  });

  CustomerLog.addHook('afterDestroy', (instance) => {
    //
  });

  return CustomerLog;
}
