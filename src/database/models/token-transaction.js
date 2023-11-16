import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class TokenTransaction extends Model {
    static associate(models) {
      TokenTransaction.belongsTo(models.user, { foreignKey: 'userId' });
      TokenTransaction.belongsTo(models.token, { foreignKey: 'tokenId' });
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
    tokenId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tokens',
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
    createdBy: {
      type: DataTypes.UUID,
      field: "created_by",
    },
    updatedBy: {
      type: DataTypes.UUID,
      field: "updated_by",
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: "deleted_at",
    }
  }, {
    modelName: 'tokenTransaction',
    tableName: 'token_transactions',
    sequelize,
    paranoid: true,
  });

  return TokenTransaction;
}