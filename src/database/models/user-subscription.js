import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class UserSubscription extends Model {
    static associate(models) {
      UserSubscription.belongsTo(models.user, { foreignKey: 'userId' });
      UserSubscription.belongsTo(models.subscription, { foreignKey: 'subscriptionId' });
      // User.belongsTo(models.role, { foreignKey: 'roleId' })
      // User.hasOne(models.agent, { foreignKey: 'userId' })
      // User.hasMany(models.agentBranch, { foreignKey: 'userId' })
      // User.hasMany(models.agentAvailability, { foreignKey: 'userId' })
      // User.hasMany(models.product, { foreignKey: 'userId' })
      // User.hasMany(models.customerWishlist, { foreignKey: 'customerId' })
      // User.hasMany(models.customerLog, { foreignKey: 'userId' })
      // User.hasMany(models.userAlert, { foreignKey: 'customerId' })
      // User.hasMany(models.productAllocation, { foreignKey: 'userId' })
      // User.hasMany(models.agentAccessLevel, { foreignKey: 'userId' })
      // User.hasMany(models.userCallBackgroundImage, { foreignKey: 'userId' })
      // User.hasMany(models.userSubscription, { foreignKey: 'userId' });
    }
  }

  UserSubscription.init({
    id: {
      type: DataTypes.UUID,
      field: "id",
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      }
    },
    subscriptionId: {
      type: DataTypes.UUID,
      references: {
        model: 'subscriptions',
        key: 'id',
      }
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING,
      unique: true,
    },
    startDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    endDate: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.STRING, // e.g., "active", "cancelled", "expired"
      allowNull: false,
    },
  }, {
    modelName: 'userSubscription',
    tableName: 'user_subscriptions',
    sequelize,
  });

  UserSubscription.addHook('beforeSave', async (instance) => {
    // if (instance.changed('password')) {
    //   instance.password = await hash(instance.password, 10);
    // }

    // if (!instance.profileImage) {
    //   instance.profileImage = '/dummy.png';
    // }
  });

  UserSubscription.addHook('afterCreate', (instance) => {
    //
  });

  UserSubscription.addHook('afterDestroy', (instance) => {
    //
  });

  return UserSubscription;
}
