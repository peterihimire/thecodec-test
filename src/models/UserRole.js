const Sequelize = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define("UserRole", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
  });

  return UserRole;
};
