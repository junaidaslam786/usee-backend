import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class ProductVisit extends Model {
    static associate(models) {
      ProductVisit.belongsTo(models.product, { foreignKey: 'productId' })
      ProductVisit.belongsTo(models.agent, { foreignKey: 'agentId' })
      ProductVisit.belongsTo(models.user, { foreignKey: 'customerId' })
    }
  }

  ProductVisit.init({
    id: {
      type: DataTypes.UUID,
      field: "id",
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4
    },
    productId: {
      type: DataTypes.UUID,
      references: {
        model: 'products',
        key: 'id',
      }
    },
    agentId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      }
    },
    customerId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      }
    },
    distance: {
      type: DataTypes.FLOAT,
    },
  }, {
    sequelize,
    modelName: 'productVisit',
    tableName: 'product_visits',
    paranoid: true,
  });

  return ProductVisit;
}