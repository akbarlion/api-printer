const express = require('express');
const { testSnmpConnection, getPrinterMetrics, scanHPInkOids } = require('../services/snmpService');
const HPWebService = require('../services/hpWebService');
const auth = require('../middleware/auth');
const router = express.Router();

// Test SNMP connection
router.get('/test/:ip', auth, async (req, res) => {
  try {
    const { ip } = req.params;
    const { community = 'public' } = req.query;
    
    const result = await testSnmpConnection(ip, community);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get printer metrics
router.get('/metrics/:ip', auth, async (req, res) => {
  try {
    const { ip } = req.params;
    const { community = 'public' } = req.query;
    
    const metrics = await getPrinterMetrics(ip, community);
    res.json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Scan HP ink OIDs
router.get('/scan-hp/:ip', auth, async (req, res) => {
  try {
    const { ip } = req.params;
    const { community = 'public' } = req.query;
    
    const results = await scanHPInkOids(ip, community);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get HP ink levels via web interface
router.get('/hp-web/:ip', auth, async (req, res) => {
  try {
    const { ip } = req.params;
    
    const result = await HPWebService.getInkLevels(ip);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SNMP profiles placeholder
router.get('/profiles', (req, res) => {
  res.json([]);
});

router.post('/profiles', (req, res) => {
  res.json({ message: 'SNMP profile created' });
});

module.exports = router;