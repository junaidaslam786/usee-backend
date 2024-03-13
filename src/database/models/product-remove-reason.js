import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class ProductRemoveReason extends Model { }

  ProductRemoveReason.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    modelName: 'productRemoveReason',
    tableName: 'product_remove_reasons',
    sequelize,
  });

  ProductRemoveReason.addHook('beforeSave', async (instance) => {
    //
  });

  ProductRemoveReason.addHook('afterCreate', (instance) => {
    //
  });

  ProductRemoveReason.addHook('afterDestroy', (instance) => {
    //
  });

  return ProductRemoveReason;
}
