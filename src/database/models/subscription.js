import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class Subscription extends Model {
    static associate(models) {
      Subscription.belongsToMany(models.feature, {
        through: 'SubscriptionFeatures',
        foreignKey: 'subscriptionId'
      })
      Subscription.hasMany(models.userSubscription, { foreignKey: 'subscriptionId' })
    }
  }

  Subscription.init({
    id: {
      type: DataTypes.UUID,
      field: "id",
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER, // e.g., in days
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    stripePlanId: {
      type: DataTypes.STRING,
      unique: true,
    },
  }, {
    modelName: 'subscription',
    tableName: 'subscriptions',
    sequelize,
  });

  Subscription.addHook('beforeSave', async (instance) => {
    if (instance.changed('password')) {
      instance.password = await hash(instance.password, 10);
    }

    if (!instance.profileImage) {
      instance.profileImage = '/dummy.png';
    }
  });

  Subscription.addHook('afterCreate', (instance) => {
    //
  });

  Subscription.addHook('afterDestroy', (instance) => {
    //
  });

  return Subscription;
}
