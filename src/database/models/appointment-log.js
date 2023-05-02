import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class AppointmentLog extends Model {

  }

  AppointmentLog.init({
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    userId: {
      field: 'user_id',
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
    userType: {
      field: 'user_type',
      type: DataTypes.STRING,
    },
    logType: {
      field: 'log_type',
      type: DataTypes.STRING,
    },
    reason: {
      type: DataTypes.TEXT,
    },
    addedAt: {
      type: DataTypes.INTEGER,
      field: 'added_at',
    },
    createdAt: {
      allowNull: false,
      field: 'created_at',
      type: DataTypes.DATE
    },
  }, {
    modelName: 'appointmentLog',
    tableName: 'appointment_logs',
    sequelize,
    updatedAt: false,
  });

  AppointmentLog.addHook('beforeSave', async (instance) => {
    //
  });

  AppointmentLog.addHook('afterCreate', (instance) => {
    //
  });

  AppointmentLog.addHook('afterDestroy', (instance) => {
    //
  });

  return AppointmentLog;
}
