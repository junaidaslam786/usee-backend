import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class ProductOffer extends Model {
    static associate(models) {
      ProductOffer.belongsTo(models.product, { foreignKey: 'productId' })
      ProductOffer.belongsTo(models.user, { foreignKey: 'customerId' })
      ProductOffer.belongsTo(models.user, { foreignKey: 'customerId', as: 'customer' })
      ProductOffer.hasOne(models.productSnagList, { foreignKey: 'offerId' })
    }
  }

  ProductOffer.init({
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
    customerId: {
      type: DataTypes.UUID,
      references: {
        model: 'customers',
        key: 'id',
      }
    },
    amount: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.STRING,
      enum: ["pending", "accepted", "rejected"]
    },
    rejectReason: {
      type: DataTypes.STRING,
    },
  }, {
    modelName: 'productOffer',
    tableName: 'product_offers',
    sequelize,
    updatedAt: false
  });

  ProductOffer.addHook('beforeSave', async (instance) => {
    //
  });

  ProductOffer.addHook('afterCreate', (instance) => {
    //
  });

  ProductOffer.addHook('afterDestroy', (instance) => {
    //
  });

  return ProductOffer;
}
