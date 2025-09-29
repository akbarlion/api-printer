const Alert = require('../models/Alert');

class AlertController {
  static async getAllAlerts(req, res) {
    try {
      const { limit = 50, offset = 0, status, severity, printer } = req.query;
      
      let alerts = await Alert.getAll(parseInt(limit), parseInt(offset));
      
      // Filter by status if provided
      if (status) {
        alerts = alerts.filter(alert => {
          if (status === 'active') return !alert.isAcknowledged;
          if (status === 'acknowledged') return alert.isAcknowledged;
          return true;
        });
      }
      
      // Filter by severity if provided
      if (severity) {
        alerts = alerts.filter(alert => alert.severity === severity);
      }
      
      // Filter by printer if provided
      if (printer) {
        alerts = alerts.filter(alert => 
          alert.printerName.toLowerCase().includes(printer.toLowerCase()) ||
          alert.ipAddress === printer
        );
      }
      
      res.json({
        success: true,
        data: alerts,
        total: alerts.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getAlertStats(req, res) {
    try {
      const stats = await Alert.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async acknowledgeAlert(req, res) {
    try {
      const { id } = req.params;
      const acknowledgedBy = req.user.username;
      
      const success = await Alert.acknowledge(id, acknowledgedBy);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Alert not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Alert acknowledged successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async deleteAlert(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
      }
      
      const { id } = req.params;
      const success = await Alert.delete(id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Alert not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Alert deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getAlertsByPrinter(req, res) {
    try {
      const { printerId } = req.params;
      const alerts = await Alert.getByPrinter(printerId);
      
      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = AlertController;