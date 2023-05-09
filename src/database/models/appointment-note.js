import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class AppointmentNote extends Model {
    
    static associate(models) {
      AppointmentNote.belongsTo(models.user, { foreignKey: 'appointmentId' });
    }
  }

  AppointmentNote.init({
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true,
      unique: true,
      autoIncrement: true,
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
    agentId: {
      field: 'agent_id',
      type: DataTypes.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    appointmentId: {
      field: 'appointment_id',
      type: DataTypes.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'appointments',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
    },
    createdAt: {
      allowNull: false,
      field: 'created_at',
      type: DataTypes.DATE
    },
  }, {
    modelName: 'appointmentNote',
    tableName: 'appointment_notes',
    sequelize,
    updatedAt: false,
  });

  AppointmentNote.addHook('beforeSave', async (instance) => {
    //
  });

  AppointmentNote.addHook('afterCreate', (instance) => {
    //
  });

  AppointmentNote.addHook('afterDestroy', (instance) => {
    //
  });

  return AppointmentNote;
}
