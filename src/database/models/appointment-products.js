import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class AppointmentProducts extends Model {

  }

  AppointmentProducts.init({
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

  AppointmentProducts.addHook('beforeSave', async (instance) => {
    //
  });

  AppointmentProducts.addHook('afterCreate', (instance) => {
    //
  });

  AppointmentProducts.addHook('afterDestroy', (instance) => {
    //
  });

  return AppointmentProducts;
}
