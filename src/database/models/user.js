import { compare, hash } from 'bcrypt';
import { DataTypes, Model } from 'sequelize';

import { tokenHelper } from '@/helpers';
// import agentAccessLevel from './agent-access-level';

export default function (sequelize) {
  class User extends Model {
    get fullName() {
      return `${this.firstName} ${this.lastName}`;
    }

    get userTypeDisplay() {
      return this.userType.charAt(0).toUpperCase() + this.userType.slice(1);
    }

    generateToken(expiresIn = '4h', agentProfile) {
      const data = {
        id: this.id,
        name: this.fullName,
        phoneNumber: this.phoneNumber,
        profileImage: this.profileImage,
        email: this.email,
        agent: agentProfile || this.agent,
        agentAccessLevels: this.agentAccessLevels,
      };
      return tokenHelper.generateToken(data, expiresIn);
    }

    validatePassword(plainPassword) {
      return compare(plainPassword, this.password);
    }

    static associate(models) {
      User.belongsTo(models.role, { foreignKey: 'roleId' });
      User.hasOne(models.agent, { foreignKey: 'userId' });
      User.hasMany(models.agentBranch, { foreignKey: 'userId' });
      User.hasMany(models.agentAvailability, { foreignKey: 'userId' });
      User.hasMany(models.product, { foreignKey: 'userId' });
      User.hasMany(models.customerWishlist, { foreignKey: 'customerId' });
      User.hasMany(models.customerLog, { foreignKey: 'userId' });
      User.hasMany(models.userAlert, { foreignKey: 'customerId' });
      User.hasMany(models.productAllocation, { foreignKey: 'userId' });
      User.hasMany(models.agentAccessLevel, { foreignKey: 'userId' });
      User.hasMany(models.userCallBackgroundImage, { foreignKey: 'userId' });
      User.hasMany(models.token, { foreignKey: 'userId' });
      User.hasMany(models.tokenTransaction, { foreignKey: 'userId' });
      User.hasMany(models.userSubscription, { foreignKey: 'userId' });
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      field: 'id',
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    phoneNumber: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        // Validate the password only if skipPasswordValidation option is not set
        passwordValidation(value) {
          console.log('PASSWORD-VALIDATION', value);
          if (!this.skipPasswordValidation && (value === null || value === undefined || value === '')) {
            throw new Error('Password is required');
          }
        },
      },
    },
    userType: {
      type: DataTypes.STRING,
      enum: ['superadmin', 'admin', 'agent', 'customer'],
    },
    profileImage: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.BOOLEAN,
    },
    active: {
      type: DataTypes.BOOLEAN,
    },
    rememberToken: {
      type: DataTypes.STRING,
    },
    rememberTokenExpire: {
      type: DataTypes.DATE,
    },
    cityName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    countryName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
    otpVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    otpCode: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    otpExpiry: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    signupStep: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      field: 'stripe_customer_id',
    },
    stripePaymentMethodId: {
      type: DataTypes.STRING,
      field: 'stripe_payment_method_id',
    },
    facebookId: {
      type: DataTypes.STRING,
      unique: true,
    },
    timezone: {
      type: DataTypes.STRING,
    },
    createdBy: {
      type: DataTypes.UUID,
      field: 'created_by',
    },
    updatedBy: {
      type: DataTypes.UUID,
      field: 'updated_by',
    },
  }, {
    modelName: 'user',
    tableName: 'users',
    sequelize,
    paranoid: true,
  });

  // Update the validation logic to skip the password requirement for Facebook login
  // User.addHook('beforeValidate', async (user, options) => {
  //   // Check if it's a Facebook login by verifying the presence of facebookId
  //   console.log('BEFORE-VALIDATE', user, options);
  //   if (user.facebookId) {
  //     // Skip the password validation
  //     // eslint-disable-next-line no-param-reassign
  //     options.skipPasswordValidation = true;
  //   }
  // });

  User.addHook('beforeSave', async (instance) => {
    if (instance.changed('password')) {
      // eslint-disable-next-line no-param-reassign
      instance.password = await hash(instance.password, 10);
    }

    if (!instance.profileImage) {
      // eslint-disable-next-line no-param-reassign
      instance.profileImage = '/dummy.png';
    }
  });

  // eslint-disable-next-line no-unused-vars
  User.addHook('afterCreate', (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  User.addHook('afterDestroy', (instance) => {
    //
  });

  return User;
}
