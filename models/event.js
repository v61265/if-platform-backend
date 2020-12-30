"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Event.hasMany(models.Work);
      Event.belongsTo(models.User, { foreignKey: "hostId" });
      Event.belongsToMany(models.User, { through: models.UserEvent });
    }
  }
  Event.init(
    {
      title: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      hostId: {
        type: DataTypes.TINYINT,
        allowNull: false,
      },
      presentAttendeesLimit: {
        type: DataTypes.TINYINT,
        allowNull: false,
      },
      time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      openWorksTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
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
      modelName: "Event",
    }
  );
  return Event;
};
