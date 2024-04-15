import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class ProductSnagListItem extends Model {
    static associate(models) {
      ProductSnagListItem.belongsTo(models.productSnagList, { foreignKey: 'snagListId' });
    }
  }

  ProductSnagListItem.init({
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    snagListId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'product_snag_list',
        key: 'id',
      },
    },
    snagKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    snagValue: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    customerComment: {
      type: DataTypes.TEXT,
      field: 'customer_comment',
    },
    agentComment: {
      type: DataTypes.TEXT,
      field: 'agent_comment',
    },
  }, {
    modelName: 'productSnagListItem',
    tableName: 'product_snag_list_items',
    sequelize,
    updatedAt: false,
  });

  ProductSnagListItem.addHook('beforeSave', async (instance) => {
    //
  });

  ProductSnagListItem.addHook('afterCreate', (instance) => {
    //
  });

  ProductSnagListItem.addHook('afterDestroy', (instance) => {
    //
  });

  return ProductSnagListItem;
}
