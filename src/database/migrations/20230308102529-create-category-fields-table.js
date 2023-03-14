export const up = (queryInterface, Sequelize) => queryInterface.createTable('category_fields', {
  id: {
    type: Sequelize.INTEGER,
    field: 'id',
    primaryKey: true,
    unique: true,
    allowNull: false,
    autoIncrement: true,
  },
  categoryId: {
    field: 'category_id',
    type: Sequelize.INTEGER,
    onDelete: 'CASCADE',
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  label: {
    type: Sequelize.STRING,
    field: 'label',
    allowNull: false
  },
  type: {
    field: 'type',
    type: Sequelize.ENUM,
    defaultValue: "text",
    values: ["text", "textarea", "select", "checkbox", "radio", "file"]
  },
  options:{
    type: Sequelize.TEXT,
    field: 'options'
  },
  required: {
    type: Sequelize.BOOLEAN,
    field: 'required',
  },
  order: {
    type: Sequelize.INTEGER,
    field: 'order',
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  updatedAt: {
    type: Sequelize.DATE,
    field: 'updated_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
});

export const down = (queryInterface) => queryInterface.dropTable('category_fields');
