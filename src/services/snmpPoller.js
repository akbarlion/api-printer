const cron = require('node-cron');
const Printer = require('../models/Printer');
const PrinterMetrics = require('../models/PrinterMetrics');
const { getPrinterMetrics } = require('./snmpService');
const db = require('../config/database');

const createAlert = async (printerId, printerName, alertType, severity, message) => {
  try {
    // Check if similar alert already exists and not acknowledged
    const [existing] = await db.execute(
      'SELECT id FROM printeralerts WHERE printerId = ? AND alertType = ? AND isAcknowledged = 0',
      [printerId, alertType]
    );
    
    if (existing.length === 0) {
      await db.execute(
        'INSERT INTO printeralerts (id, printerId, printerName, alertType, severity, message, isAcknowledged, createdAt) VALUES (UUID(), ?, ?, ?, ?, ?, 0, NOW())',
        [printerId, printerName, alertType, severity, message]
      );
      console.log(`Alert created: ${alertType} for ${printerName}`);
    }
  } catch (error) {
    console.error('Error creating alert:', error);
  }
};

const checkForAlerts = async (printer, metrics) => {
  // Check toner/ink levels
  if (metrics.tonerLevel && metrics.tonerLevel < 20) {
    await createAlert(printer.id, printer.name, 'toner_low', 'medium', `Toner level is ${metrics.tonerLevel}%`);
  }
  
  if (metrics.blackLevel && metrics.blackLevel < 20) {
    await createAlert(printer.id, printer.name, 'toner_low', 'medium', `Black ink level is ${metrics.blackLevel}%`);
  }
  
  // Check paper status
  if (metrics.paperTrayStatus && metrics.paperTrayStatus.toLowerCase().includes('empty')) {
    await createAlert(printer.id, printer.name, 'paper_empty', 'high', 'Paper tray is empty');
  }
  
  // Check device status
  if (metrics.deviceStatus && metrics.deviceStatus.toLowerCase().includes('error')) {
    await createAlert(printer.id, printer.name, 'error', 'critical', `Device error: ${metrics.deviceStatus}`);
  }
};

const pollPrinter = async (printer) => {
  try {
    const metrics = await getPrinterMetrics(printer.ipAddress);
    
    await PrinterMetrics.create({
      printerId: printer.id,
      cyanLevel: metrics.cyanLevel,
      magentaLevel: metrics.magentaLevel,
      yellowLevel: metrics.yellowLevel,
      blackLevel: metrics.blackLevel,
      tonerLevel: metrics.tonerLevel,
      paperTrayStatus: metrics.paperTrayStatus,
      pageCounter: metrics.pageCounter,
      deviceStatus: metrics.deviceStatus,
      printerType: metrics.printerType
    });
    
    // Check for alerts
    await checkForAlerts(printer, metrics);
    
    await printer.update({
      status: 'online',
      lastPolled: new Date()
    });
    
    console.log(`Polled printer ${printer.name} successfully`);
  } catch (error) {
    await printer.update({
      status: 'offline',
      lastPolled: new Date()
    });
    
    // Create offline alert
    await createAlert(printer.id, printer.name, 'offline', 'critical', 'Printer is offline');
    
    console.error(`Failed to poll printer ${printer.name}:`, error.message);
  }
};

const pollAllPrinters = async () => {
  try {
    const printers = await Printer.findAll({
      where: { isActive: true }
    });
    
    console.log(`Starting polling for ${printers.length} printers`);
    
    for (const printer of printers) {
      await pollPrinter(printer);
    }
  } catch (error) {
    console.error('Error in polling cycle:', error);
  }
};

const startPollingScheduler = () => {
  // Poll every 30 seconds
  cron.schedule('*/30 * * * * *', pollAllPrinters);
  console.log('SNMP polling scheduler started (every 30 seconds)');
};

module.exports = {
  startPollingScheduler,
  pollAllPrinters,
  pollPrinter
};