const Printer = require('../models/Printer');
const PrinterMetrics = require('../models/PrinterMetrics');
const { testSnmpConnection } = require('../services/snmpService');

const getAllPrinters = async (req, res) => {
  try {
    const printers = await Printer.findAll({
      where: { isActive: true },
      include: [{
        model: PrinterMetrics,
        limit: 1,
        order: [['createdAt', 'DESC']]
      }]
    });
    res.json(printers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching printers', error: error.message });
  }
};

const getPrinter = async (req, res) => {
  try {
    const printer = await Printer.findByPk(req.params.id, {
      include: [PrinterMetrics]
    });
    
    if (!printer) {
      return res.status(404).json({ message: 'Printer not found' });
    }
    
    res.json(printer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching printer', error: error.message });
  }
};

const createPrinter = async (req, res) => {
  try {
    const printer = await Printer.create(req.body);
    res.status(201).json(printer);
  } catch (error) {
    res.status(400).json({ message: 'Error creating printer', error: error.message });
  }
};

const updatePrinter = async (req, res) => {
  try {
    const [updated] = await Printer.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (!updated) {
      return res.status(404).json({ message: 'Printer not found' });
    }
    
    const printer = await Printer.findByPk(req.params.id);
    res.json(printer);
  } catch (error) {
    res.status(400).json({ message: 'Error updating printer', error: error.message });
  }
};

const deletePrinter = async (req, res) => {
  try {
    const deleted = await Printer.update(
      { isActive: false },
      { where: { id: req.params.id } }
    );
    
    if (!deleted[0]) {
      return res.status(404).json({ message: 'Printer not found' });
    }
    
    res.json({ message: 'Printer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting printer', error: error.message });
  }
};

const testConnection = async (req, res) => {
  try {
    const { ipAddress, snmpProfile } = req.body;
    const result = await testSnmpConnection(ipAddress, snmpProfile);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Connection test failed', error: error.message });
  }
};

module.exports = {
  getAllPrinters,
  getPrinter,
  createPrinter,
  updatePrinter,
  deletePrinter,
  testConnection
};