import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class Token extends Model {
    static associate(models) {
      Token.belongsTo(models.user, { foreignKey: 'userId' });
      Token.belongsTo(models.feature, { foreignKey: 'featureId' }); // If tokens are linked to a specific feature
    }
  }

  Token.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    acquiredDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    featureId: {
      type: DataTypes.UUID,
      references: {
        model: 'features',
        key: 'id'
      }
    },
    stripeInvoiceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripeInvoiceStatus: {
      type: DataTypes.ENUM('draft', 'open', 'void', 'paid', 'uncollectible'),
      allowNull: true,
    },
  }, {
    modelName: 'token',
    tableName: 'tokens',
    sequelize,
  });

  return Token;
}