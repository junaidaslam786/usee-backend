import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class ProductSnagList extends Model {
    static associate(models) {
      ProductSnagList.belongsTo(models.productOffer, { foreignKey: 'offerId' })
      ProductSnagList.hasMany(models.productSnagListItem, { foreignKey: 'snagListId' })
    }
  }

  ProductSnagList.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
    offerId: {
      type: DataTypes.UUID,
      references: {
        model: 'product_offers',
        key: 'id',
      }
    },
    agentApproved: {
      type: DataTypes.BOOLEAN,
    },
    customerApproved: {
      type: DataTypes.BOOLEAN,
    },
  }, {
    modelName: 'productSnagList',
    tableName: 'product_snag_list',
    sequelize,
    updatedAt: false
  });

  ProductSnagList.addHook('beforeSave', async (instance) => {
    //
  });

  ProductSnagList.addHook('afterCreate', (instance) => {
    //
  });

  ProductSnagList.addHook('afterDestroy', (instance) => {
    //
  });

  return ProductSnagList;
}
