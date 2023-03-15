import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class ProductMetaTag extends Model {
    static associate(models) {
      ProductMetaTag.belongsTo(models.product, { foreignKey: 'productId' })
      ProductMetaTag.belongsTo(models.categoryField, { foreignKey: 'key' })
    }
  }

  ProductMetaTag.init({
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
    key: {
      allowNull: true,
      type: DataTypes.UUID,
      field: "key",
      references: {
        model: "category_fields",
        key: "id"
      },
      onUpdate: "CASCADE",
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    modelName: 'productMetaTag',
    tableName: 'product_meta_tags',
    sequelize,
    updatedAt: false
  });

  ProductMetaTag.addHook('beforeSave', async (instance) => {
    //
  });

  ProductMetaTag.addHook('afterCreate', (instance) => {
    //
  });

  ProductMetaTag.addHook('afterDestroy', (instance) => {
    //
  });

  return ProductMetaTag;
}
