"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Event);
      User.hasMany(models.Work);
      User.belongsToMany(models.Event, { through: "UserEvent" });
      User.belongsToMany(models.Work, { through: "UserWork" });
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      nickname: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      session: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      contact: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      portrait: {
        type: DataTypes.STRING,
        defaultValue: "https://ppt.cc/fni7cx@.jpg",
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM,
        values: ["admin", "active-member", "frozen"],
        defaultValue: "frozen",
        allowNull: false,
      },
      record: DataTypes.TEXT,
      description: DataTypes.TEXT,
      emailTime: {
        type: DataTypes.TEXT,
        defaultValue: '{"time":["all"]}',
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
