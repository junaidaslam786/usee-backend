import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class FeatureUsage extends Model {}
  
  FeatureUsage.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
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
  featureId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'features',
      key: 'id'
    }
  },
  usedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
  }, {
  modelName: 'featureUsage',
  tableName: 'feature_usages',
  sequelize,
  });
}
