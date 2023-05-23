import { compare, hash } from 'bcrypt';
import { DataTypes, Model } from 'sequelize';

import { tokenHelper } from '@/helpers';

export default function (sequelize) {
  class User extends Model {
    get fullName() {
      return `${this.firstName} ${this.lastName}`;
    }

    get userTypeDisplay() {
      return this.userType.charAt(0).toUpperCase() + this.userType.slice(1);
    }

    generateToken(expiresIn = '4h', agentProfile) {
      const data = { id: this.id, name: this.fullName, phoneNumber: this.phoneNumber, profileImage: this.profileImage, email: this.email, agent: agentProfile || this.agent };
      return tokenHelper.generateToken(data, expiresIn);
    }

    validatePassword(plainPassword) {
      return compare(plainPassword, this.password);
    }

    static associate(models) {
      User.belongsTo(models.role, { foreignKey: 'roleId' })
      User.hasOne(models.agent, { foreignKey: 'userId' })
      User.hasMany(models.agentBranch, { foreignKey: 'userId' })
      User.hasMany(models.agentAvailability, { foreignKey: 'userId' })
      User.hasMany(models.product, { foreignKey: 'userId' })
      User.hasMany(models.customerWishlist, { foreignKey: 'customerId' })
      User.hasMany(models.customerLog, { foreignKey: 'userId' })
      User.hasMany(models.userAlert, { foreignKey: 'customerId' })
      User.hasMany(models.productAllocation, { foreignKey: 'userId' })
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      field: "id",
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4
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
    },
    userType: {
      type: DataTypes.STRING,
      enum: ["admin", "agent", "customer"]
    },
    profileImage: {
      type: DataTypes.STRING,
    },
    status: {
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
    },
    roleId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'roles',
        key: 'id',
      }
    },
    otpVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    otpCode: {
      type: DataTypes.INTEGER,
      defaultValue: null
    },
    otpExpiry: {
      type: DataTypes.DATE,
      defaultValue: null
    },
    signupStep: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    timezone: {
      type: DataTypes.STRING,
    },
    createdBy: {
      type: DataTypes.UUID,
      field: "created_by",
    },
    updatedBy: {
      type: DataTypes.UUID,
      field: "updated_by",
    },
  }, {
    modelName: 'user',
    tableName: 'users',
    sequelize,
    paranoid: true
  });

  User.addHook('beforeSave', async (instance) => {
    if (instance.changed('password')) {
      instance.password = await hash(instance.password, 10);
    }

    if (!instance.profileImage) {
      instance.profileImage = '/dummy.png';
    }
  });

  User.addHook('afterCreate', (instance) => {
    //
  });

  User.addHook('afterDestroy', (instance) => {
    //
  });

  return User;
}
