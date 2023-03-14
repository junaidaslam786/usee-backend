import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class ProductRemoveRequest extends Model {
    static associate(models) {
        ProductRemoveRequest.belongsTo(models.user, { foreignKey: 'userId' })
        ProductRemoveRequest.belongsTo(models.product, { foreignKey: 'productId' })
        ProductRemoveRequest.belongsTo(models.productRemoveReason, { foreignKey: 'removeReasonId' })
    }
  }

  ProductRemoveRequest.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      }
    },
    productId: {
      type: DataTypes.UUID,
      references: {
        model: 'products',
        key: 'id',
      }
    },
    removeReasonId: {
      type: DataTypes.UUID,
      references: {
        model: 'product_remove_reasons',
        key: 'id',
      }
    },
    reason: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.BOOLEAN, // 0. pending, 1. approved 2. rejected
    },
    createdBy: {
        type: DataTypes.UUID,
        field: 'created_by'
    },
  }, {
    modelName: 'productRemoveRequest',
    tableName: 'product_remove_request',
    sequelize,
    updatedAt: false
  });

  ProductRemoveRequest.addHook('beforeSave', async (instance) => {
    //
  });

  ProductRemoveRequest.addHook('afterCreate', (instance) => {
    //
  });

  ProductRemoveRequest.addHook('afterDestroy', (instance) => {
    //
  });

  return ProductRemoveRequest;
}
