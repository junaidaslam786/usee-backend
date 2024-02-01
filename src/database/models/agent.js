import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class Agent extends Model {
    static associate(models) {
      Agent.belongsTo(models.user, { foreignKey: 'userId' });
      Agent.belongsTo(models.appointment, { foreignKey: 'userId' });
      Agent.belongsTo(models.agentBranch, { foreignKey: 'branchId' });
      Agent.hasMany(models.agentAvailability, { foreignKey: 'userId' });
      Agent.hasMany(models.product, { foreignKey: 'userId' });
      Agent.hasMany(models.productAllocation, { foreignKey: 'userId' });
      Agent.hasMany(models.agentAccessLevel, { foreignKey: 'userId' });
      Agent.hasMany(models.userCallBackgroundImage, { foreignKey: 'userId' });
      Agent.hasMany(models.userSubscription, { foreignKey: 'userId' });
      Agent.hasMany(models.agent, { foreignKey: 'agentId' });
      Agent.hasMany(models.agent, { foreignKey: 'managerId' });
      Agent.hasMany(models.agent, { foreignKey: 'userId' });
    }
  }

  Agent.init({
    id: {
      type: DataTypes.UUID,
      field: 'id',
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      allowNull: true,
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
    },
    agentId: {
      allowNull: true,
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
    },
    managerId: {
      allowNull: true,
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
    },
    agentType: {
      type: DataTypes.STRING,
      enum: ['agent', 'manager', 'staff'],
    },
    companyName: {
      type: DataTypes.STRING,
    },
    companyLogo: {
      type: DataTypes.STRING,
    },
    companyAddress: {
      type: DataTypes.TEXT,
    },
    companyPosition: {
      type: DataTypes.STRING,
    },
    mobileNumber: {
      type: DataTypes.STRING,
    },
    zipCode: {
      type: DataTypes.STRING,
    },
    mortgageAdvisorEmail: {
      type: DataTypes.STRING,
    },
    jobTitle: {
      type: DataTypes.STRING,
    },
    licenseNo: {
      type: DataTypes.STRING,
    },
    ornNumber: {
      type: DataTypes.STRING,
    },
    branchId: {
      allowNull: true,
      type: DataTypes.UUID,
      references: {
        model: 'agent_branches',
        key: 'id',
      },
      onUpdate: 'CASCADE',
    },
    apiCode: {
      type: DataTypes.STRING,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
    },
    documentUrl: {
      type: DataTypes.STRING,
      defaultValue: null,
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
    modelName: 'agent',
    tableName: 'agents',
    sequelize,
    paranoid: true,
  });

  // eslint-disable-next-line no-unused-vars
  Agent.addHook('beforeSave', async (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  Agent.addHook('afterCreate', (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  Agent.addHook('afterDestroy', (instance) => {
    //
  });

  return Agent;
}
