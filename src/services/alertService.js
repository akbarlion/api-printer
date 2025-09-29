const Alert = require('../models/Alert');
const db = require('../config/database');

class AlertService {
  static async checkAndCreateAlerts(printerId, printerName, metrics) {
    const alerts = [];
    
    try {
      // Check toner/ink levels
      if (metrics.tonerLevel !== null && metrics.tonerLevel < 20) {
        await this.createAlert({
          printerId,
          printerName,
          alertType: 'toner_low',
          severity: metrics.tonerLevel < 10 ? 'critical' : 'high',
          message: `Toner level is ${metrics.tonerLevel}%`
        });
      }
      
      // Check ink levels for inkjet printers
      const inkLevels = [
        { color: 'Black', level: metrics.blackLevel },
        { color: 'Cyan', level: metrics.cyanLevel },
        { color: 'Magenta', level: metrics.magentaLevel },
        { color: 'Yellow', level: metrics.yellowLevel }
      ];
      
      for (const ink of inkLevels) {
        if (ink.level !== null && ink.level < 20) {
          await this.createAlert({
            printerId,
            printerName,
            alertType: 'toner_low',
            severity: ink.level < 10 ? 'critical' : 'high',
            message: `${ink.color} ink level is ${ink.level}%`
          });
        }
      }
      
      // Check paper tray status
      if (metrics.paperTrayStatus && metrics.paperTrayStatus.toLowerCase().includes('empty')) {
        await this.createAlert({
          printerId,
          printerName,
          alertType: 'paper_empty',
          severity: 'medium',
          message: 'Paper tray is empty'
        });
      }
      
      // Check device status
      if (metrics.deviceStatus && metrics.deviceStatus.toLowerCase().includes('error')) {
        await this.createAlert({
          printerId,
          printerName,
          alertType: 'error',
          severity: 'high',
          message: `Device error: ${metrics.deviceStatus}`
        });
      }
      
    } catch (error) {
      console.error('Error creating alerts:', error);
    }
  }
  
  static async createOfflineAlert(printerId, printerName) {
    try {
      await this.createAlert({
        printerId,
        printerName,
        alertType: 'offline',
        severity: 'critical',
        message: 'Printer is offline'
      });
    } catch (error) {
      console.error('Error creating offline alert:', error);
    }
  }
  
  static async createAlert(alertData) {
    try {
      // Check if similar alert already exists and is not acknowledged
      const [existing] = await db.execute(`
        SELECT id FROM PrinterAlerts 
        WHERE printerId = ? AND alertType = ? AND isAcknowledged = 0
        AND createdAt > DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `, [alertData.printerId, alertData.alertType]);
      
      // Don't create duplicate alerts within 1 hour
      if (existing.length > 0) {
        return null;
      }
      
      return await Alert.create(alertData);
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }
  
  static async cleanupOldAlerts() {
    try {
      // Delete acknowledged alerts older than 30 days
      await db.execute(`
        DELETE FROM PrinterAlerts 
        WHERE isAcknowledged = 1 AND acknowledgedAt < DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);
      
      console.log('Old alerts cleaned up');
    } catch (error) {
      console.error('Error cleaning up old alerts:', error);
    }
  }
}

module.exports = AlertService;