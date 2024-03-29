import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class UserAlert extends Model {
    static associate(models) {
      UserAlert.belongsTo(models.product, { foreignKey: 'productId' });
      UserAlert.belongsTo(models.user, { foreignKey: 'customerId', as: 'customerAlertUser' });
      UserAlert.belongsTo(models.user, { foreignKey: 'agentId', as: 'AgentAlertUser' });
    }
  }

  UserAlert.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
    customerId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    agentId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.UUID,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    keyId: {
      type: DataTypes.UUID,
    },
    alertMode: {
      type: DataTypes.STRING,
    },
    alertType: {
      type: DataTypes.INTEGER,
      // (wishlist 1-Added,2-Removed ##### Interest 1-Interested,2-Not interested ##### 1. customer appointment)
    },
    removed: {
      type: DataTypes.BOOLEAN,
    },
    viewed: {
      type: DataTypes.BOOLEAN,
    },
    emailed: {
      type: DataTypes.BOOLEAN,
    },
    createdBy: {
      type: DataTypes.UUID,
      field: 'created_by',
    },
  }, {
    modelName: 'userAlert',
    tableName: 'user_alerts',
    sequelize,
    updatedAt: false,
  });

  // eslint-disable-next-line no-unused-vars
  UserAlert.addHook('beforeSave', async (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  UserAlert.addHook('afterCreate', (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  UserAlert.addHook('afterDestroy', (instance) => {
    //
  });

  return UserAlert;
}
