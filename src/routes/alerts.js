const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// Test database connection (no auth)
router.get('/test', async (req, res) => {
  try {
    const [result] = await db.execute('SELECT 1 as test');
    const [tables] = await db.execute('SHOW TABLES LIKE "printeralerts"');
    const [count] = await db.execute('SELECT COUNT(*) as count FROM printeralerts');
    res.json({ 
      message: 'Database connection OK', 
      test: result,
      tableExists: tables.length > 0,
      alertCount: count[0].count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all alerts
router.get('/', auth, async (req, res) => {
  try {
    const [alerts] = await db.execute(
      'SELECT * FROM printeralerts ORDER BY createdAt DESC LIMIT 50'
    );
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alert statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN isAcknowledged = 0 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN isAcknowledged = 1 THEN 1 ELSE 0 END) as acknowledged,
        SUM(CASE WHEN severity = 'critical' AND isAcknowledged = 0 THEN 1 ELSE 0 END) as critical_active
      FROM printeralerts
    `);

    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Acknowledge alert
router.put('/:id/acknowledge', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { acknowledged_by } = req.body;

    const [result] = await db.execute(
      'UPDATE printeralerts SET isAcknowledged = 1, acknowledgedBy = ?, acknowledgedAt = NOW() WHERE id = ?',
      [acknowledged_by || req.user.username, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ message: 'Alert acknowledged successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve alert
router.put('/:id/resolve', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { resolved_by, resolution_notes } = req.body;

    const [result] = await db.execute(
      'UPDATE printeralerts SET status = "resolved", resolved_by = ?, resolved_at = NOW(), resolution_notes = ? WHERE id = ?',
      [resolved_by || req.user.username, resolution_notes, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ message: 'Alert resolved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete alert (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM printeralerts WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;