const express = require('express');
const {
  getAllPrinters,
  getPrinter,
  createPrinter,
  updatePrinter,
  deletePrinter,
  testConnection
} = require('../controllers/printerController');

const router = express.Router();

router.get('/', getAllPrinters);
router.get('/:id', getPrinter);
router.post('/', createPrinter);
router.put('/:id', updatePrinter);
router.delete('/:id', deletePrinter);
router.post('/test', testConnection);

module.exports = router;