const cron = require('node-cron');
const Printer = require('../models/Printer');
const PrinterMetrics = require('../models/PrinterMetrics');
const AlertService = require('./alertService');
const { getPrinterMetrics } = require('./snmpService');
const HPWebService = require('./hpWebService');

const pollPrinter = async (printer) => {
  try {
    let metrics;
    
    try {
      // Try SNMP first
      metrics = await getPrinterMetrics(printer.ipAddress);
      
      // If SNMP returns all 0% or null, try HP Web
      const hasValidData = metrics.blackLevel > 0 || metrics.cyanLevel > 0 || 
                          metrics.magentaLevel > 0 || metrics.yellowLevel > 0;
      
      if (!hasValidData && printer.model?.toLowerCase().includes('hp')) {
        console.log(`SNMP returned 0% for ${printer.name}, trying HP Web...`);
        const hpResult = await HPWebService.getInkLevels(printer.ipAddress);
        if (hpResult.success) {
          metrics = { ...metrics, ...hpResult.data };
          console.log(`HP Web successful for ${printer.name}`);
        }
      }
    } catch (snmpError) {
      // If SNMP fails completely, try HP Web
      console.log(`SNMP failed for ${printer.name}, trying HP Web...`);
      const hpResult = await HPWebService.getInkLevels(printer.ipAddress);
      if (hpResult.success) {
        metrics = hpResult.data;
        console.log(`HP Web fallback successful for ${printer.name}`);
      } else {
        throw snmpError; // Re-throw original SNMP error
      }
    }
    
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
    await AlertService.checkAndCreateAlerts(printer.id, printer.name, metrics);
    
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
    await AlertService.createOfflineAlert(printer.id, printer.name);
    
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
  
  // Cleanup old alerts daily at 2 AM
  cron.schedule('0 2 * * *', AlertService.cleanupOldAlerts);
  console.log('Alert cleanup scheduler started (daily at 2 AM)');
};

module.exports = {
  startPollingScheduler,
  pollAllPrinters,
  pollPrinter
};