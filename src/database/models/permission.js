import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class Permission extends Model {
    static associate(models) {
      Permission.belongsToMany(models.role, { through: 'role_permissions', updatedAt: false, unique: false });
    }
  }

  Permission.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    modelName: 'permission',
    tableName: 'permissions',
    sequelize,
    paranoid: false
  });

  Permission.addHook('beforeSave', async (instance) => {
    //
  });

  Permission.addHook('afterCreate', (instance) => {
    //
  });

  Permission.addHook('afterDestroy', (instance) => {
    //
  });

  return Permission;
}
