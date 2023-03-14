import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class ProductAllocation extends Model {
    static associate(models) {
        ProductAllocation.belongsTo(models.user, { foreignKey: 'userId', sourceKey: 'userId'})
        ProductAllocation.belongsTo(models.product, { foreignKey: 'productId' })
        ProductAllocation.belongsTo(models.user, { foreignKey: 'userId', sourceKey: 'allocatedUserId'})
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
