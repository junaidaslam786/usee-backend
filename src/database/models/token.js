import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class Token extends Model {
    static associate(models) {
      Token.belongsTo(models.user, { foreignKey: 'userId' });
      // Token.belongsTo(models.feature, { foreignKey: 'featureId' }); // If tokens are linked to a specific feature
    }
  }

  Token.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
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
    remainingAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    acquiredDate: {
      type: DataTypes.DATE,
    },
    stripeInvoiceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripeInvoiceStatus: {
      type: DataTypes.ENUM('draft', 'open', 'void', 'paid', 'uncollectible'),
      allowNull: true,
    },
    stripeInvoiceData: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    stripeCheckoutSessionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripeCheckoutSessionData: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    refundStatus: {
      type: DataTypes.ENUM('duplicate', 'fraudulent', 'requested_by_customer'),
      allowNull: true,
    },
    refundAmount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    refundInvoiceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    valid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdBy: {
      type: DataTypes.UUID,
      field: 'created_by',
    },
    updatedBy: {
      type: DataTypes.UUID,
      field: 'updated_by',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at',
    },
  }, {
    modelName: 'token',
    tableName: 'tokens',
    sequelize,
    paranoid: true,
  });

  return Token;
}
