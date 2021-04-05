"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.EmailTime, { foreignKey: "userId" });
      User.hasMany(models.Event, { as: "host", foreignKey: "hostId" });
      User.hasMany(models.Work, { as: "works", foreignKey: "authorId" });
      User.hasMany(models.Comment, {
        as: "commentBy",
        foreignKey: "reviewerId",
      });
      User.belongsToMany(models.Event, {
        as: "participate",
        through: "user_events",
      });
      User.belongsToMany(models.Work, {
        as: "readRecord",
        through: "User_Works",
      });
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
