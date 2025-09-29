const express = require('express');
const AlertController = require('../controllers/alertController');
const auth = require('../middleware/auth');
const db = require('../config/database');
const router = express.Router();

// Test endpoint
router.get('/test', async (req, res) => {
  try {
    const [result] = await db.execute('SELECT COUNT(*) as count FROM PrinterAlerts');
    res.json({ success: true, count: result[0].count });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Get all alerts with filtering
router.get('/', auth, AlertController.getAllAlerts);

// Get alert statistics
router.get('/stats', auth, AlertController.getAlertStats);

// Get alerts by printer
router.get('/printer/:printerId', auth, AlertController.getAlertsByPrinter);

// Acknowledge alert
router.put('/:id/acknowledge', auth, AlertController.acknowledgeAlert);

// Delete alert (admin only)
router.delete('/:id', auth, AlertController.deleteAlert);

module.exports = router;