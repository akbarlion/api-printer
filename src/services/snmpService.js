const snmp = require('net-snmp');

const PRINTER_OIDS = {
  // Ink levels (for inkjet printers)
  CYAN_LEVEL: '1.3.6.1.2.1.43.11.1.1.6.1.1',
  MAGENTA_LEVEL: '1.3.6.1.2.1.43.11.1.1.6.1.2', 
  YELLOW_LEVEL: '1.3.6.1.2.1.43.11.1.1.6.1.3',
  BLACK_LEVEL: '1.3.6.1.2.1.43.11.1.1.6.1.4',
  // Toner level (for laser printers)
  TONER_LEVEL: '1.3.6.1.2.1.43.11.1.1.9.1.1',
  // Common OIDs
  PAPER_TRAY_STATUS: '1.3.6.1.2.1.43.8.2.1.10.1.1',
  PAGE_COUNTER: '1.3.6.1.2.1.43.10.2.1.4.1.1',
  DEVICE_STATUS: '1.3.6.1.2.1.25.3.2.1.5.1',
  DEVICE_DESCRIPTION: '1.3.6.1.2.1.1.1.0'
};

const createSession = (ipAddress, community = 'public') => {
  return snmp.createSession(ipAddress, community, {
    port: 161,
    retries: 3,
    timeout: 5000,
    version: snmp.Version2c
  });
};

const testSnmpConnection = async (ipAddress, community = 'public') => {
  return new Promise((resolve) => {
    const session = createSession(ipAddress, community);
    
    session.get([PRINTER_OIDS.DEVICE_DESCRIPTION], (error, varbinds) => {
      session.close();
      
      if (error) {
        resolve({ success: false, message: error.message });
      } else {
        resolve({ 
          success: true, 
          message: 'Connection successful',
          deviceInfo: varbinds[0]?.value?.toString() || 'Unknown device'
        });
      }
    });
  });
};

const getPrinterMetrics = async (ipAddress, community = 'public') => {
  return new Promise((resolve, reject) => {
    const session = createSession(ipAddress, community);
    const oids = Object.values(PRINTER_OIDS);
    
    session.get(oids, (error, varbinds) => {
      session.close();
      
      if (error) {
        reject(error);
      } else {
        const parseLevel = (value) => {
          if (!value) return null;
          const str = value.toString().toLowerCase();
          if (str.includes('unknown') || str.includes('empty') || str.includes('not installed')) return 0;
          const num = parseInt(str.replace(/\D/g, ''));
          return isNaN(num) ? null : Math.min(Math.max(num, 0), 100);
        };
        
        const parsePageCounter = (value) => {
          if (!value) return 0;
          const num = parseInt(value.toString().replace(/\D/g, ''));
          return isNaN(num) ? 0 : num;
        };
        
        const detectPrinterType = (cyan, magenta, yellow, black, toner) => {
          if (toner !== null) return 'laser';
          if (cyan !== null || magenta !== null || yellow !== null || black !== null) return 'inkjet';
          return 'unknown';
        };
        
        const cyanLevel = parseLevel(varbinds[0]?.value);
        const magentaLevel = parseLevel(varbinds[1]?.value);
        const yellowLevel = parseLevel(varbinds[2]?.value);
        const blackLevel = parseLevel(varbinds[3]?.value);
        const tonerLevel = parseLevel(varbinds[4]?.value);
        
        const metrics = {
          cyanLevel,
          magentaLevel,
          yellowLevel,
          blackLevel,
          tonerLevel,
          paperTrayStatus: varbinds[5]?.value?.toString() || 'unknown',
          pageCounter: parsePageCounter(varbinds[6]?.value),
          deviceStatus: varbinds[7]?.value?.toString() || 'unknown',
          deviceDescription: varbinds[8]?.value?.toString() || 'unknown',
          printerType: detectPrinterType(cyanLevel, magentaLevel, yellowLevel, blackLevel, tonerLevel),
          timestamp: new Date()
        };
        resolve(metrics);
      }
    });
  });
};

module.exports = {
  testSnmpConnection,
  getPrinterMetrics,
  PRINTER_OIDS
};