const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Printer = require('./Printer');

const PrinterMetrics = sequelize.define('PrinterMetrics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  printerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Printer,
      key: 'id'
    }
  },
  cyanLevel: {
    type: DataTypes.INTEGER,
    validate: { min: 0, max: 100 }
  },
  magentaLevel: {
    type: DataTypes.INTEGER,
    validate: { min: 0, max: 100 }
  },
  yellowLevel: {
    type: DataTypes.INTEGER,
    validate: { min: 0, max: 100 }
  },
  blackLevel: {
    type: DataTypes.INTEGER,
    validate: { min: 0, max: 100 }
  },
  tonerLevel: {
    type: DataTypes.INTEGER,
    validate: { min: 0, max: 100 }
  },
  paperTrayStatus: {
    type: DataTypes.STRING
  },
  pageCounter: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  deviceStatus: {
    type: DataTypes.STRING
  },
  printerType: {
    type: DataTypes.ENUM('inkjet', 'laser', 'unknown'),
    defaultValue: 'unknown'
  }
});

Printer.hasMany(PrinterMetrics, { foreignKey: 'printerId' });
PrinterMetrics.belongsTo(Printer, { foreignKey: 'printerId' });

module.exports = PrinterMetrics;