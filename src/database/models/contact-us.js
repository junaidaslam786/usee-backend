import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class ContactUs extends Model {
  }

  ContactUs.init({
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
    subject: {
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
    modelName: 'contactUs',
    tableName: 'contact_us',
    sequelize,
    updatedAt: false,
  });

  // eslint-disable-next-line no-unused-vars
  ContactUs.addHook('beforeSave', async (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  ContactUs.addHook('afterCreate', (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  ContactUs.addHook('afterDestroy', (instance) => {
    //
  });

  return ContactUs;
}
