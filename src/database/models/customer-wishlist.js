import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class CustomerWishlist extends Model {
    static associate(models) {
        CustomerWishlist.belongsTo(models.user, { foreignKey: 'customerId' })
        CustomerWishlist.belongsTo(models.product, { foreignKey: 'productId' })
    }
  }

  CustomerWishlist.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
  }, {
    modelName: 'customerWishlist',
    tableName: 'customer_wishlists',
    sequelize,
  });

  CustomerWishlist.addHook('beforeSave', async (instance) => {
    //
  });

  CustomerWishlist.addHook('afterCreate', (instance) => {
    //
  });

  CustomerWishlist.addHook('afterDestroy', (instance) => {
    //
  });

  return CustomerWishlist;
}
