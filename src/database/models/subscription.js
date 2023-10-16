import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class Subscription extends Model {
    // get fullName() {
    //   return `${this.firstName} ${this.lastName}`;
    // }

    // get userTypeDisplay() {
    //   return this.userType.charAt(0).toUpperCase() + this.userType.slice(1);
    // }

    // generateToken(expiresIn = '4h', agentProfile) {
    //   const data = {
    //     id: this.id,
    //     name: this.fullName,
    //     phoneNumber: this.phoneNumber,
    //     profileImage: this.profileImage,
    //     email: this.email,
    //     agent: agentProfile || this.agent,
    //     agentAccessLevels: this.agentAccessLevels
    //   };
    //   return tokenHelper.generateToken(data, expiresIn);
    // }

    // validatePassword(plainPassword) {
    //   return compare(plainPassword, this.password);
    // }

    static associate(models) {
      Subscription.hasMany(models.userSubscription, { foreignKey: 'subscriptionId' })
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
