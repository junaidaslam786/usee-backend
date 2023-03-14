import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.user, { foreignKey: 'userId' })
      Product.belongsTo(models.category, { foreignKey: 'categoryId' })
      Product.hasMany(models.productDocument, { foreignKey: 'productId'})
      Product.hasMany(models.productImage, { foreignKey: 'productId'})
      Product.hasMany(models.productMetaTag, { foreignKey: 'productId'})
      Product.hasMany(models.productAllocation, { foreignKey: 'productId'})
    }
  }

  Product.init({
    id: {
      type: DataTypes.UUID,
      field: "id",
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4
    },
    agentType: {
        type: DataTypes.STRING,
        field: "type",
        enum: ["agent", "manager", "staff"]
    },
    title: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.STRING,
    },
    featuredImage: {
      type: DataTypes.STRING,
    },
    virtualTourType: {
      type: DataTypes.STRING,
      enum: ["video", "url", "slideshow"]
    },
    virtualTourUrl: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
    },
    city: {
      type: DataTypes.STRING,
    },
    postalCode: {
      type: DataTypes.STRING,
    },
    region: {
      type: DataTypes.STRING,
    },
    latitude: {
      type: DataTypes.STRING,
    },
    longitude: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
      enum: ["active", "archive", "disabled", "removed"]
    },
    apiCode: {
      type: DataTypes.STRING,
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
    modelName: 'product',
    tableName: 'products',
    sequelize,
  });

  Product.addHook('beforeSave', async (instance) => {
    //
  });

  Product.addHook('afterCreate', (instance) => {
    //
  });

  Product.addHook('afterDestroy', (instance) => {
    //
  });

  return Product;
}
