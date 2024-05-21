import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class AppointmentProduct extends Model {
    static associate(models) {
      AppointmentProduct.belongsTo(models.appointment, { foreignKey: 'appointmentId' });
      AppointmentProduct.belongsTo(models.product, { foreignKey: 'productId' });
    }
  }

  AppointmentProduct.init({
    id: {
      type: DataTypes.UUID,
      field: 'id',
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    appointmentId: {
      field: 'appointment_id',
      type: DataTypes.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'appointments',
        key: 'id',
      },
    },
    productId: {
      field: 'product_id',
      type: DataTypes.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'products',
        key: 'id',
      },
    },
    interest: {
      field: 'interest',
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    co2Details: {
      field: 'co2_details',
      type: DataTypes.JSON,
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
  }, {
    modelName: 'appointmentProduct',
    tableName: 'appointment_products',
    sequelize,
  });

  // eslint-disable-next-line no-unused-vars
  AppointmentProduct.addHook('beforeSave', async (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  AppointmentProduct.addHook('afterCreate', (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  AppointmentProduct.addHook('afterDestroy', (instance) => {
    //
  });

  return AppointmentProduct;
}
