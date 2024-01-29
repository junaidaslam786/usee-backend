import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class ProductAllocation extends Model {
    static associate(models) {
      ProductAllocation.belongsTo(models.user, { foreignKey: 'userId' });
      ProductAllocation.belongsTo(models.product, { foreignKey: 'productId' });
    }
  }

  ProductAllocation.init({
    id: {
      type: DataTypes.UUID,
      field: 'id',
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.UUID,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    createdBy: {
      type: DataTypes.UUID,
      field: 'created_by',
    },
  }, {
    modelName: 'productAllocation',
    tableName: 'product_allocations',
    sequelize,
    updatedAt: false,
  });

  // eslint-disable-next-line no-unused-vars
  ProductAllocation.addHook('beforeSave', async (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  ProductAllocation.addHook('afterCreate', (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  ProductAllocation.addHook('afterDestroy', (instance) => {
    //
  });

  return ProductAllocation;
}
