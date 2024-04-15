import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class Role extends Model {
    static associate(models) {
      Role.belongsToMany(models.permission, { through: 'role_permissions', updatedAt: false, unique: false });
    }
  }

  Role.init({
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
    description: {
      type: DataTypes.TEXT,
    },
  }, {
    modelName: 'role',
    tableName: 'roles',
    sequelize,
  });

  Role.addHook('beforeSave', async (instance) => {
    //
  });

  Role.addHook('afterCreate', (instance) => {
    //
  });

  Role.addHook('afterDestroy', (instance) => {
    //
  });

  return Role;
}
