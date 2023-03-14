import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class CategoryField extends Model {
    static associate(models) {
      CategoryField.belongsTo(models.category, { foreignKey: 'categoryId' });
    }
  }

  CategoryField.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
    label: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
      field: "type",
      enum: ["text", "textarea", "select", "checkbox", "radio", "file"]
    },
    options: {
      type: DataTypes.TEXT,
    },
    required: {
      type: DataTypes.BOOLEAN,
    },
    order: {
      type: DataTypes.INTEGER,
    },
  }, {
    modelName: 'categoryField',
    tableName: 'category_fields',
    sequelize,
  });

  CategoryField.addHook('beforeSave', async (instance) => {
    //
  });

  CategoryField.addHook('afterCreate', (instance) => {
    //
  });

  CategoryField.addHook('afterDestroy', (instance) => {
    //
  });

  return CategoryField;
}
