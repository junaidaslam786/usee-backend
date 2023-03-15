import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class ProductImage extends Model {
    static associate(models) {
        ProductImage.belongsTo(models.product, { foreignKey: 'productId' })
    }
  }

  ProductImage.init({
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
    image: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sortOrder: {
        type: DataTypes.INTEGER,
    },
    createdBy: {
        type: DataTypes.UUID,
        field: "created_by",
    },
  }, {
    modelName: 'productImage',
    tableName: 'product_images',
    sequelize,
  });

  ProductImage.addHook('beforeSave', async (instance) => {
    //
  });

  ProductImage.addHook('afterCreate', (instance) => {
    //
  });

  ProductImage.addHook('afterDestroy', (instance) => {
    //
  });

  return ProductImage;
}
