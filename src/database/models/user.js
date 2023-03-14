import { compare, hash } from 'bcrypt';
import { DataTypes, Model } from 'sequelize';

import { tokenHelper, mailHelper } from '@/helpers';

export default function (sequelize) {
  class User extends Model {
    get fullName() {
      return `${this.firstName} ${this.lastName}`;
    }

    get userTypeDisplay() {
      return this.userType.charAt(0).toUpperCase() + this.userType.slice(1);
    }

    generateToken(expiresIn = '1h') {
      const data = { id: this.id, email: this.email };
      return tokenHelper.generateToken(data, expiresIn);
    }

    validatePassword(plainPassword) {
      return compare(plainPassword, this.password);
    }

    sendMail(mail) {
      const payload = { ...mail, to: `${this.fullName} <${this.email}>` };
      return mailHelper.sendMail(payload);
    }

    static associate(models) {
      User.belongsTo(models.city, { foreignKey: 'cityId' })
      User.belongsTo(models.role, { foreignKey: 'roleId' })
      User.hasMany(models.agent, { foreignKey: 'userId' })
      User.hasMany(models.agentBranch, { foreignKey: 'userId' })
      User.hasMany(models.agentAvailability, { foreignKey: 'userId' })
      User.hasMany(models.product, { foreignKey: 'userId' })
      User.hasMany(models.customerWishlist, { foreignKey: 'userId' })
      User.hasMany(models.customerLog, { foreignKey: 'userId' })
      User.hasMany(models.userAlert, { foreignKey: 'customerId' })
      User.hasMany(models.productAllocation, { foreignKey: 'userId' })
      User.hasMany(models.productAllocation, { foreignKey: 'allocatedUserId' })
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
      unique: true,
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
  });

  User.addHook('afterCreate', (instance) => {
    //
  });

  User.addHook('afterDestroy', (instance) => {
    //
  });

  return User;
}
