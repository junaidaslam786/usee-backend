import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class ProductLog extends Model {
    static associate(models) {
      ProductLog.belongsTo(models.user, {
        foreignKey: 'userId',
        as: 'user',
      });

      ProductLog.belongsTo(models.product, {
        foreignKey: 'productId',
        as: 'product',
      });
    }
  }

  ProductLog.init({
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true,
      unique: true,
      autoIncrement: true,
    },
    userId: {
      field: 'user_id',
      type: DataTypes.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    productId: {
      field: 'product_id',
      type: DataTypes.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'products',
        key: 'id',
      },
    },
    userType: {
      field: 'user_type',
      type: DataTypes.STRING,
    },
    logType: {
      field: 'log_type',
      type: DataTypes.STRING,
    },
    reason: {
      type: DataTypes.TEXT,
    },
    createdAt: {
      allowNull: false,
      field: 'created_at',
      type: DataTypes.DATE,
    },
  }, {
    modelName: 'productLog',
    tableName: 'product_logs',
    sequelize,
    updatedAt: false,
  });

  ProductLog.addHook('beforeSave', async (instance) => {
    //
  });

  ProductLog.addHook('afterCreate', (instance) => {
    //
  });

  ProductLog.addHook('afterDestroy', (instance) => {
    //
  });

  return ProductLog;
}
