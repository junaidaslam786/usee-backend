import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.categoryField, { foreignKey: 'categoryId' });
    }
  }

  Category.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
  }, {
    modelName: 'category',
    tableName: 'categories',
    sequelize,
  });

  Category.addHook('beforeSave', async (instance) => {
    //
  });

  Category.addHook('afterCreate', (instance) => {
    //
  });

  Category.addHook('afterDestroy', (instance) => {
    //
  });

  return Category;
}
