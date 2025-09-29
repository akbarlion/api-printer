const db = require('../config/database');

class Alert {
  static async getAll(limit = 50, offset = 0) {
    try {
      const limitNum = parseInt(limit) || 50;
      const offsetNum = parseInt(offset) || 0;
      
      const [alerts] = await db.execute(`
        SELECT 
          pa.id,
          pa.printerId,
          pa.printerName,
          pa.alertType,
          pa.severity,
          pa.message,
          pa.isAcknowledged,
          pa.acknowledgedAt,
          pa.createdAt
        FROM PrinterAlerts pa
        ORDER BY pa.createdAt DESC
        LIMIT ${limitNum} OFFSET ${offsetNum}
      `);
      
      return alerts;
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const [stats] = await db.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN isAcknowledged = 0 THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN isAcknowledged = 1 THEN 1 ELSE 0 END) as acknowledged
        FROM PrinterAlerts
      `);

      return stats[0];
    } catch (error) {
      console.error('Error in getStats:', error);
      throw error;
    }
  }

  static async getByPrinter(printerId) {
    try {
      const [alerts] = await db.execute(`
        SELECT 
          pa.id,
          pa.printerId,
          pa.printerName,
          pa.alertType,
          pa.severity,
          pa.message,
          pa.isAcknowledged,
          pa.acknowledgedAt,
          pa.createdAt
        FROM PrinterAlerts pa
        WHERE pa.printerId = ? 
        ORDER BY pa.createdAt DESC
      `, [printerId]);
      
      return alerts;
    } catch (error) {
      console.error('Error in getByPrinter:', error);
      throw error;
    }
  }

  static async acknowledge(id, acknowledgedBy) {
    try {
      const [result] = await db.execute(`
        UPDATE PrinterAlerts 
        SET isAcknowledged = 1, acknowledgedAt = NOW() 
        WHERE id = ?
      `, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in acknowledge:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM PrinterAlerts WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }

  static async create(alertData) {
    try {
      const { printerId, printerName, alertType, severity, message } = alertData;
      
      const [result] = await db.execute(`
        INSERT INTO PrinterAlerts (printerId, printerName, alertType, severity, message)
        VALUES (?, ?, ?, ?, ?)
      `, [printerId, printerName, alertType, severity, message]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error in create:', error, alertData);
      throw error;
    }
  }
}

module.exports = Alert;