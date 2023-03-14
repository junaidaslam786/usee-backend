import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class ProductDocument extends Model {
    static associate(models) {
        ProductDocument.belongsTo(models.product, { foreignKey: 'productId' })
    }
  }

  ProductDocument.init({
    id: {
        type: DataTypes.UUID,
        field: "id",
        primaryKey: true,
        unique: true,
        defaultValue: DataTypes.UUIDV4
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    file: {
        type: DataTypes.STRING,
        allowNull: false,
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
    modelName: 'productDocument',
    tableName: 'product_documents',
    sequelize,
  });

  ProductDocument.addHook('beforeSave', async (instance) => {
    //
  });

  ProductDocument.addHook('afterCreate', (instance) => {
    //
  });

  ProductDocument.addHook('afterDestroy', (instance) => {
    //
  });

  return ProductDocument;
}
