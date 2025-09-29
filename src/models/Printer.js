const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Printer = sequelize.define('Printer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isIP: true }
  },
  model: {
    type: DataTypes.STRING
  },
  location: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('online', 'offline', 'warning', 'error'),
    defaultValue: 'offline'
  },
  snmpProfile: {
    type: DataTypes.STRING,
    defaultValue: 'default'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastPolled: {
    type: DataTypes.DATE
  }
});

module.exports = Printer;