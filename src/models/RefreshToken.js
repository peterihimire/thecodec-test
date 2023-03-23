const Sequelize = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const config = require("../config/auth.config");
require("dotenv").config();

module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define("RefreshToken", {
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
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  RefreshToken.createToken = async (user) => {
    let expiredAt = new Date();

    expiredAt.setSeconds(
      expiredAt.getSeconds() + config.jwt_refresh_expiration
    );
    let _token = uuidv4();

    let refreshToken = await RefreshToken.create({
      token: _token,
      UserId: user.id,
      expiryDate: expiredAt.getTime(),
    });
    return refreshToken.token;
  };

  RefreshToken.verifyExpiration = (token) => {
    return token.expiryDate.getTime() < new Date().getTime();
  };

  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User, {
      onDelete: "CASCADE",
      foreignKey: "UserId",
      targetKey: "id",
    });
  };

  return RefreshToken;
};
