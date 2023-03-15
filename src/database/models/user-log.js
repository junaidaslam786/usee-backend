import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class UserLog extends Model {
    static associate(models) {
      UserLog.belongsTo(models.user, { foreignKey: 'userId' });
    }
  }

  UserLog.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      }
    },
    subject: {
      type: DataTypes.TEXT,
    },
    url: {
      type: DataTypes.STRING,
    },
    method: {
      type: DataTypes.STRING,
    },
    ipAddress: {
      type: DataTypes.STRING,
    },
    browser: {
      type: DataTypes.TEXT,
    },
  }, {
    modelName: 'userLog',
    tableName: 'user_logs',
    sequelize,
  });

  UserLog.addHook('beforeSave', async (instance) => {
    //
  });

  UserLog.addHook('afterCreate', (instance) => {
    //
  });

  UserLog.addHook('afterDestroy', (instance) => {
    //
  });

  return UserLog;
}
