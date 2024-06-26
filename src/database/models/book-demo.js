import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class BookDemo extends Model {
  }

  BookDemo.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    jobTitle: {
      type: DataTypes.STRING,
      field: 'job_title',
    },
    phoneNumber: {
      type: DataTypes.STRING,
      field: 'phone_number',
    },
    message: {
      type: DataTypes.TEXT,
    },
  }, {
    modelName: 'bookDemo',
    tableName: 'book_demo',
    sequelize,
    updatedAt: false,
  });

  // eslint-disable-next-line no-unused-vars
  BookDemo.addHook('beforeSave', async (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  BookDemo.addHook('afterCreate', (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  BookDemo.addHook('afterDestroy', (instance) => {
    //
  });

  return BookDemo;
}
