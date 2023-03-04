const Sequelize = require("sequelize");
const db = require('../models')
const UserRole = db.UserRole;

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      unique: true,
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    businessEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  User.associate = (models) => {
      User.belongsToMany(models.Role, {
        through: models.UserRole,
        onDelete: "CASCADE",
        // foreignKey: "ProductId",
        // as: "Product",
      });
  }

  return User;
};
