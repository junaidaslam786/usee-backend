import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class ProductOffer extends Model {
    static associate(models) {
      ProductOffer.belongsTo(models.product, { foreignKey: 'productId' });
      ProductOffer.belongsTo(models.user, { foreignKey: 'customerId' });
      ProductOffer.belongsTo(models.user, { foreignKey: 'customerId', as: 'customer' });
      ProductOffer.hasOne(models.productSnagList, { foreignKey: 'offerId' });
    }
  }

  ProductOffer.init({
    id: {
      type: DataTypes.UUID,
      field: 'id',
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    productId: {
      type: DataTypes.UUID,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    customerId: {
      type: DataTypes.UUID,
      references: {
        model: 'customers',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM,
      defaultValue: 'pending',
      values: ['pending', 'accepted', 'rejected'],
    },
    rejectReason: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    acceptedAt: {
      type: DataTypes.DATE,
    },
  }, {
    modelName: 'productOffer',
    tableName: 'product_offers',
    sequelize,
    updatedAt: false,
  });

  // eslint-disable-next-line no-unused-vars
  ProductOffer.addHook('beforeSave', async (instance) => {
    if (instance.changed('status')) {
      if (instance.status === 'accepted') {
        const updatedProdutOffer = { ...instance.attributes, acceptedAt: new Date() };
        instance.set(updatedProdutOffer);
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  ProductOffer.addHook('afterCreate', (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  ProductOffer.addHook('afterDestroy', (instance) => {
    //
  });

  return ProductOffer;
}
