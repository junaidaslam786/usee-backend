import { DataTypes, Model } from 'sequelize';

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

  // eslint-disable-next-line no-unused-vars
  Appointment.addHook('afterSave', async (instance) => {
    if (instance.status === 'inprogress') {
      const userSubscription = await sequelize.models.userSubscription.findOne({
        where: {
          userId: instance.agentId,
          subscriptionId: '35e0b998-53bc-4777-a207-261fff3489aa',
          featureId: '159c869a-1b24-4cd3-ac61-425645b730c7',
        },
      });
      // console.log('UserSubscription found:', userSubscription);

      if (userSubscription) {
        await Promise.all(instance.products.map(async (product) => {
          const [productSubscription, created] = await sequelize.models.productSubscription.findOrCreate({
            where: { userSubscriptionId: userSubscription.id, productId: product.id },
          });
          // console.log('Product created(ID):', productSubscription);
          console.log('created:', created);

          if (created) {
            productSubscription.freeRemainingUnits = 4;
            productSubscription.paidRemainingUnits = 0;
            productSubscription.save();
          }
        }));
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
