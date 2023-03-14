import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class ProductAllocation extends Model {
    static associate(models) {
        ProductAllocation.belongsTo(models.user, { foreignKey: 'userId'})
        ProductAllocation.belongsTo(models.product, { foreignKey: 'productId' })
        ProductAllocation.belongsTo(models.user, { foreignKey: 'allocatedUserId' })
    }
  }

  ProductAllocation.init({
    id: {
        type: DataTypes.UUID,
        field: "id",
        primaryKey: true,
        unique: true,
        defaultValue: DataTypes.UUIDV4
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
    allocatedUserId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      }
    },
    createdBy: {
        type: DataTypes.UUID,
        field: "created_by",
    },
    updatedBy: {
        type: DataTypes.UUID,
        field: "updated_by",
    },
  }, {
    modelName: 'productAllocation',
    tableName: 'product_allocations',
    sequelize,
    updatedAt: false
  });

  ProductAllocation.addHook('beforeSave', async (instance) => {
    //
  });

  ProductAllocation.addHook('afterCreate', (instance) => {
    //
  });

  ProductAllocation.addHook('afterDestroy', (instance) => {
    //
  });

  return ProductAllocation;
}
