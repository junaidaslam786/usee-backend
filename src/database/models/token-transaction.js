import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class TokenTransaction extends Model {
    static associate(models) {
      TokenTransaction.belongsTo(models.user, { foreignKey: 'userId' });
    }
  }

  TokenTransaction.init({
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
    amount: {
      type: DataTypes.INTEGER, // can be negative if tokens are spent or positive if added
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING, // e.g., "Tokens spent on XYZ service"
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    modelName: 'tokenTransaction',
    tableName: 'token_transactions',
    sequelize,
  });

  return TokenTransaction;
}