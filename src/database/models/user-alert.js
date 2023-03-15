import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class UserAlert extends Model {
    static associate(models) {
        UserAlert.belongsTo(models.user, { foreignKey: 'customerId' })
        UserAlert.belongsTo(models.product, { foreignKey: 'productId' })
    }
  }

  UserAlert.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
    customerId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      }
    },
    productId: {
      type: DataTypes.UUID,
      references: {
        model: 'products',
        key: 'id',
      }
    },
    alertMode: {
      type: DataTypes.STRING,
      field: "type",
      enum: ["wishlist", "interest", "offer"]
    },
    alertType: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.BOOLEAN,
    },
    viewed: {
      type: DataTypes.BOOLEAN,
    },
    emailed: {
      type: DataTypes.BOOLEAN,
    },
    createdBy: {
      type: DataTypes.UUID,
      field: 'created_by'
    },
  }, {
    modelName: 'userAlert',
    tableName: 'user_alerts',
    sequelize,
  });

  UserAlert.addHook('beforeSave', async (instance) => {
    //
  });

  UserAlert.addHook('afterCreate', (instance) => {
    //
  });

  UserAlert.addHook('afterDestroy', (instance) => {
    //
  });

  return UserAlert;
}
