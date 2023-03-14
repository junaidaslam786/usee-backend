import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsToMany(models.product, { through: 'appointment_products', updatedAt: false, unique: false });
    }
  }

  Appointment.init({
    id: {
      type: DataTypes.UUID,
      field: 'id',
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4
    },
    agentId: {
      field: 'agent_id',
      type: DataTypes.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    customerId: {
      field: 'customer_id',
      type: DataTypes.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    allotedAgent: {
      field: 'alloted_agent',
      type: DataTypes.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    appointmentDate: {
      field: 'appointment_date',
      allowNull: false,
      type: DataTypes.DATE
    },
    appointmentTime: {
      field: 'appointment_time',
      allowNull: false,
      type: DataTypes.TIME
    },
    customerPhoneNumber: {
      type: DataTypes.STRING,
      field: 'customer_phonenumber'
    },
    sessionId: {
      type: DataTypes.STRING,
      field: 'session_id'
    },
    createdAt: {
      allowNull: false,
      field: 'created_at',
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      field: 'updated_at',
      type: DataTypes.DATE
    },
    deletedAt: {
      allowNull: true,
      type: DataTypes.DATE,
      field: 'deleted_at',
      defaultValue: null
    }
  }, {
    modelName: 'appointment',
    tableName: 'appointments',
    sequelize,
  });

  Appointment.addHook('beforeSave', async (instance) => {
    //
  });

  Appointment.addHook('afterCreate', (instance) => {
    //
  });

  Appointment.addHook('afterDestroy', (instance) => {
    //
  });

  return Appointment;
}
