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
      Product.belongsToMany(models.appointment, { through: 'appointment_products', updatedAt: false, unique: false });
      Product.hasMany(models.productOffer, { foreignKey: 'productId'})
      Product.hasMany(models.productLog, { foreignKey: 'productId'})
      Product.hasOne(models.productRemoveRequest, { foreignKey: 'productId', as: 'removeRequest'})
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
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      }
    },
    categoryId: {
      type: DataTypes.UUID,
      references: {
        model: 'categories',
        key: 'id',
      }
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
    },
    apiCode: {
      type: DataTypes.STRING,
    },
    geometry: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: true,
    },
    soldDate: {
      type: DataTypes.DATEONLY
    },
    soldTime: {
      type: DataTypes.TEXT,
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
    paranoid: true
  });

  Product.addHook('beforeSave', async (instance) => {
    if (!instance.featuredImage) {
      instance.featuredImage = '/dummy_prop.jpg';
    }
  });

  Product.addHook('afterCreate', (instance) => {
    //
  });

  Product.addHook('afterDestroy', (instance) => {
    //
  });

  return Product;
}
