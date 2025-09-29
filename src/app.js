require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const printerRoutes = require('./routes/printers');
const alertRoutes = require('./routes/alerts');
const snmpRoutes = require('./routes/snmp');

const { sequelize } = require('./config/database');
const { startPollingScheduler } = require('./services/snmpPoller');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/printers', printerRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/snmp', snmpRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    await sequelize.sync();
    console.log('Database synchronized');
    
    startPollingScheduler();
    console.log('SNMP polling scheduler started');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();