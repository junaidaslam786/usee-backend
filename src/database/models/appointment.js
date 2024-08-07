import { DataTypes, Model } from 'sequelize';
import { APPOINTMENT_LOG_TYPE, USER_TYPE } from '@/config/constants';

const cron = require('node-cron');

export default function (sequelize) {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsToMany(models.product, { through: 'appointment_products', updatedAt: false, unique: false });
      Appointment.belongsTo(models.user, { foreignKey: 'agentId', as: 'agentUser' });
      Appointment.belongsTo(models.user, { foreignKey: 'customerId', as: 'customerUser' });
      Appointment.belongsTo(models.user, { foreignKey: 'allotedAgent', as: 'allotedAgentUser' });
      Appointment.belongsTo(models.agentTimeSlot, { foreignKey: 'timeSlotId' });
      Appointment.hasMany(models.appointmentLog, { foreignKey: 'appointmentId' });
      Appointment.hasMany(models.appointmentNote, { foreignKey: 'appointmentId' });
    }
  }

  Appointment.init({
    id: {
      type: DataTypes.UUID,
      field: 'id',
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    agentId: {
      field: 'agent_id',
      type: DataTypes.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    customerId: {
      field: 'customer_id',
      type: DataTypes.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    allotedAgent: {
      field: 'alloted_agent',
      type: DataTypes.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    appointmentDate: {
      field: 'appointment_date',
      allowNull: false,
      type: DataTypes.DATEONLY,
    },
    timeSlotId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'agent_time_slots',
        key: 'id',
      },
    },
    sessionId: {
      type: DataTypes.STRING,
      field: 'session_id',
    },
    status: {
      type: DataTypes.STRING,
    },
    startMeetingTime: {
      type: DataTypes.STRING,
      field: 'start_meeting_time',
    },
    endMeetingTime: {
      type: DataTypes.STRING,
      field: 'end_meeting_time',
    },
    appointmentTimeGmt: {
      type: DataTypes.STRING,
      field: 'appointment_time_gmt',
    },
    scheduledJobAgent: {
      type: DataTypes.STRING,
      field: 'scheduled_job_agent',
    },
    scheduledJobCustomer: {
      type: DataTypes.STRING,
      field: 'scheduled_job_customer',
    },
    co2Details: {
      type: DataTypes.JSON,
      field: 'co2_details',
    },
    createdAt: {
      allowNull: false,
      field: 'created_at',
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      field: 'updated_at',
      type: DataTypes.DATE,
    },
    deletedAt: {
      allowNull: true,
      type: DataTypes.DATE,
      field: 'deleted_at',
      defaultValue: null,
    },
  }, {
    modelName: 'appointment',
    tableName: 'appointments',
    sequelize,
    paranoid: true,
  });

  // eslint-disable-next-line no-unused-vars
  Appointment.addHook('beforeSave', async (instance) => {
    //
  });

  Appointment.addHook('afterSave', async (instance, options) => {
    const subscription = await sequelize.models.subscription.findOne({
      where: { name: 'USEE360 Basic' },
    });

    const feature = await sequelize.models.feature.findOne({
      where: { name: 'Video Call' },
    });

    const userSubscription = await sequelize.models.userSubscription.findOne({
      where: {
        userId: instance.agentId,
        subscriptionId: subscription.id,
        featureId: feature.id,
      },
    });

    if (instance.changed('status')) {
      if (instance.status === 'inprogress') {
        // Deduct units based on subscription when the meeting starts(both agent and customer join the appointment)
        if (userSubscription) {
          try {
            await instance.reload({ include: ['products'] });

            await Promise.all(instance.products.map(async (product) => {
              const [productSubscription, created] = await sequelize.models.productSubscription.findOrCreate({
                where: { userSubscriptionId: userSubscription.id, productId: product.id },
              });

              if (productSubscription) {
                if (productSubscription.freeRemainingUnits > 0) {
                  // deduct free units from properties if available
                  productSubscription.freeRemainingUnits -= 1;
                  await productSubscription.save();
                } else {
                  // deduct free units from userSubscription
                  if (userSubscription.paidRemainingUnits > 0) {
                    userSubscription.paidRemainingUnits -= 1;
                  } else {
                    // no paid available
                  }
                  await userSubscription.save();
                }
              }
            }));
          } catch (error) {
            console.error('Error deducting tokens or saving subscription:', error);
          }
        }
      } else if (instance.status === 'expired') {
        // Deduct from missed call quota of agent when they don't join the call
        if (userSubscription) {
          try {
            await instance.reload({ include: ['products', 'appointmentLogs'] });

            await Promise.all(instance.products.map(async (product) => {
              const [productSubscription, created] = await sequelize.models.productSubscription.findOrCreate({
                where: { userSubscriptionId: userSubscription.id, productId: product.id },
                transaction: options.transaction,
              });

              if (productSubscription) {
                // Check if there's NO joined appointment log for this appointment by the AGENT
                const hasJoinedLog = await instance.appointmentLogs.some((log) => log.log_type
                  === APPOINTMENT_LOG_TYPE.JOINED
                  && log.userId === userSubscription.userId
                  && log.userType === USER_TYPE.AGENT);

                if (!hasJoinedLog) {
                  if (productSubscription.freeRemainingUnits > 0) {
                    // deduct free units from properties if available
                    productSubscription.freeRemainingUnits -= 1;
                    productSubscription.videoCallsMissed += 1;
                    await productSubscription.save();
                  } else {
                    //
                  }
                }
              }
            }));
          } catch (error) {
            console.error('Error reloading appointment or saving subscription:', error);
          }
        }
      }
    }
  });

  Appointment.addHook('beforeDestroy', async (instance) => {
    const { scheduledJobAgent, scheduledJobCustomer } = instance;
    if (scheduledJobCustomer) {
      const deletedJob = cron.destroy(scheduledJobCustomer);
      console.log('DeletedJob(Customer): ', deletedJob);
    }
    if (scheduledJobAgent) {
      const deletedJob = cron.destroy(scheduledJobAgent);
      console.log('DeletedJob(Agent): ', deletedJob);
    }
  });

  return Appointment;
}
