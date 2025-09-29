const snmp = require('net-snmp');

const PRINTER_OIDS = {
  // System Info
  SYSTEM_DESCRIPTION: '1.3.6.1.2.1.1.1.0',
  CONTACT: '1.3.6.1.2.1.1.4.0',
  LOCATION: '1.3.6.1.2.1.1.6.0',
  UPTIME: '1.3.6.1.2.1.1.3.0',
  SERIAL_NUMBER: '1.3.6.1.2.1.43.5.1.1.17.1',
  
  // Device Status
  DEVICE_DESCRIPTION: '1.3.6.1.2.1.25.3.2.1.3.1',
  DEVICE_STATE: '1.3.6.1.2.1.25.3.2.1.5.1',
  DEVICE_ERRORS: '1.3.6.1.2.1.25.3.2.1.6.1',
  PAGE_COUNT: '1.3.6.1.2.1.43.10.2.1.4.1.1',
  
  // Paper Trays
  TRAY_1_NAME: '1.3.6.1.2.1.43.8.2.1.13.1.1',
  TRAY_1_CAPACITY: '1.3.6.1.2.1.43.8.2.1.9.1.1',
  TRAY_1_LEVEL: '1.3.6.1.2.1.43.8.2.1.10.1.1',
  
  // INK TANK PRINTER OIDs (Smart Tank, EcoTank, dll)
  // Menggunakan phrMarkerSuppliesEntry untuk ink tank
  INK_BLACK_NAME: '1.3.6.1.2.1.43.11.1.1.6.1.1',
  INK_BLACK_CAPACITY: '1.3.6.1.2.1.43.11.1.1.8.1.1',
  INK_BLACK_LEVEL: '1.3.6.1.2.1.43.11.1.1.9.1.1',
  
  INK_CYAN_NAME: '1.3.6.1.2.1.43.11.1.1.6.1.2',
  INK_CYAN_CAPACITY: '1.3.6.1.2.1.43.11.1.1.8.1.2',
  INK_CYAN_LEVEL: '1.3.6.1.2.1.43.11.1.1.9.1.2',
  
  INK_MAGENTA_NAME: '1.3.6.1.2.1.43.11.1.1.6.1.3',
  INK_MAGENTA_CAPACITY: '1.3.6.1.2.1.43.11.1.1.8.1.3',
  INK_MAGENTA_LEVEL: '1.3.6.1.2.1.43.11.1.1.9.1.3',
  
  INK_YELLOW_NAME: '1.3.6.1.2.1.43.11.1.1.6.1.4',
  INK_YELLOW_CAPACITY: '1.3.6.1.2.1.43.11.1.1.8.1.4',
  INK_YELLOW_LEVEL: '1.3.6.1.2.1.43.11.1.1.9.1.4',
  
  // TONER CARTRIDGE OIDs (Laser Printer)
  // Biasanya menggunakan index yang berbeda atau OID khusus
  TONER_BLACK_NAME: '1.3.6.1.2.1.43.11.1.1.6.1.1',
  TONER_BLACK_CAPACITY: '1.3.6.1.2.1.43.11.1.1.8.1.1',
  TONER_BLACK_LEVEL: '1.3.6.1.2.1.43.11.1.1.9.1.1',
  
  TONER_CYAN_NAME: '1.3.6.1.2.1.43.11.1.1.6.1.2',
  TONER_CYAN_CAPACITY: '1.3.6.1.2.1.43.11.1.1.8.1.2',
  TONER_CYAN_LEVEL: '1.3.6.1.2.1.43.11.1.1.9.1.2',
  
  TONER_MAGENTA_NAME: '1.3.6.1.2.1.43.11.1.1.6.1.3',
  TONER_MAGENTA_CAPACITY: '1.3.6.1.2.1.43.11.1.1.8.1.3',
  TONER_MAGENTA_LEVEL: '1.3.6.1.2.1.43.11.1.1.9.1.3',
  
  TONER_YELLOW_NAME: '1.3.6.1.2.1.43.11.1.1.6.1.4',
  TONER_YELLOW_CAPACITY: '1.3.6.1.2.1.43.11.1.1.8.1.4',
  TONER_YELLOW_LEVEL: '1.3.6.1.2.1.43.11.1.1.9.1.4'
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
    
    session.get([PRINTER_OIDS.SYSTEM_DESCRIPTION], (error, varbinds) => {
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
    
    // Essential printer metrics OIDs (using INK for Smart Tank)
    const metricsOids = [
      PRINTER_OIDS.INK_BLACK_LEVEL,
      PRINTER_OIDS.INK_CYAN_LEVEL,
      PRINTER_OIDS.INK_MAGENTA_LEVEL,
      PRINTER_OIDS.INK_YELLOW_LEVEL,
      PRINTER_OIDS.INK_BLACK_CAPACITY,
      PRINTER_OIDS.INK_CYAN_CAPACITY,
      PRINTER_OIDS.INK_MAGENTA_CAPACITY,
      PRINTER_OIDS.INK_YELLOW_CAPACITY,
      PRINTER_OIDS.INK_BLACK_NAME,
      PRINTER_OIDS.TRAY_1_LEVEL,
      PRINTER_OIDS.PAGE_COUNT,
      PRINTER_OIDS.DEVICE_STATE,
      PRINTER_OIDS.SYSTEM_DESCRIPTION
    ];
    
    session.get(metricsOids, (error, varbinds) => {
      session.close();
      
      if (error) {
        reject(error);
      } else {
        // Debug logging
        console.log('Raw SNMP values:', {
          black_level: varbinds[0]?.value,
          cyan_level: varbinds[1]?.value,
          magenta_level: varbinds[2]?.value,
          yellow_level: varbinds[3]?.value,
          black_capacity: varbinds[4]?.value,
          cyan_capacity: varbinds[5]?.value,
          magenta_capacity: varbinds[6]?.value,
          yellow_capacity: varbinds[7]?.value
        });
        
        // Calculate percentage levels
        const calculatePercentage = (current, max) => {
          if (current === null || current === undefined || max === null || max === undefined) return null;
          const curr = parseInt(current);
          const maxVal = parseInt(max);
          if (isNaN(curr) || isNaN(maxVal) || maxVal === 0) return null;
          return Math.round((curr / maxVal) * 100);
        };
        
        let blackLevel = calculatePercentage(varbinds[0]?.value, varbinds[4]?.value);
        let cyanLevel = calculatePercentage(varbinds[1]?.value, varbinds[5]?.value);
        let magentaLevel = calculatePercentage(varbinds[2]?.value, varbinds[6]?.value);
        let yellowLevel = calculatePercentage(varbinds[3]?.value, varbinds[7]?.value);
        let tonerLevel = null;
        
        console.log('Calculated percentages:', {
          black: blackLevel,
          cyan: cyanLevel,
          magenta: magentaLevel,
          yellow: yellowLevel
        });
        
        const detectPrinterType = (cyan, magenta, yellow, black, inkName) => {
          // Check ink name to determine type
          const inkNameStr = inkName?.toString().toLowerCase() || '';
          if (inkNameStr.includes('toner')) return 'laser';
          if (inkNameStr.includes('ink') || cyan !== null || magenta !== null || yellow !== null || black !== null) return 'inkjet';
          return 'unknown';
        };
        
        const parsePageCounter = (value) => {
          if (!value) return 0;
          const num = parseInt(value.toString().replace(/\D/g, ''));
          return isNaN(num) ? 0 : num;
        };
        
        const metrics = {
          cyanLevel,
          magentaLevel,
          yellowLevel,
          blackLevel,
          tonerLevel,
          paperTrayStatus: varbinds[8]?.value?.toString() || 'unknown',
          pageCounter: parsePageCounter(varbinds[9]?.value),
          deviceStatus: varbinds[10]?.value?.toString() || 'unknown',
          deviceDescription: varbinds[11]?.value?.toString() || 'unknown',
          printerType: detectPrinterType(cyanLevel, magentaLevel, yellowLevel, blackLevel, varbinds[8]?.value),
          timestamp: new Date()
        };
        resolve(metrics);
      }
    });
  });
};

const scanHPInkOids = async (ipAddress, community = 'public') => {
  return new Promise((resolve, reject) => {
    const session = createSession(ipAddress, community);
    
    // Comprehensive scan OIDs for ink tank printer
    const scanOids = [
      PRINTER_OIDS.INK_BLACK_LEVEL,
      PRINTER_OIDS.INK_CYAN_LEVEL,
      PRINTER_OIDS.INK_MAGENTA_LEVEL,
      PRINTER_OIDS.INK_YELLOW_LEVEL,
      PRINTER_OIDS.INK_BLACK_CAPACITY,
      PRINTER_OIDS.INK_CYAN_CAPACITY,
      PRINTER_OIDS.INK_MAGENTA_CAPACITY,
      PRINTER_OIDS.INK_YELLOW_CAPACITY,
      PRINTER_OIDS.INK_BLACK_NAME,
      PRINTER_OIDS.INK_CYAN_NAME,
      PRINTER_OIDS.INK_MAGENTA_NAME,
      PRINTER_OIDS.INK_YELLOW_NAME
    ];
    
    session.get(scanOids, (error, varbinds) => {
      session.close();
      
      if (error) {
        reject(error);
      } else {
        // Detect printer type from names
        const blackName = varbinds[8]?.value?.toString().toLowerCase() || '';
        const printerType = blackName.includes('toner') ? 'laser' : 
                          blackName.includes('ink') ? 'inkjet' : 'unknown';
        
        const results = {
          printer_type: printerType,
          supplies: {
            black: { 
              level: varbinds[0]?.value, 
              capacity: varbinds[4]?.value, 
              name: varbinds[8]?.value?.toString(),
              percentage: varbinds[4]?.value ? Math.round((varbinds[0]?.value / varbinds[4]?.value) * 100) : 0
            },
            cyan: { 
              level: varbinds[1]?.value, 
              capacity: varbinds[5]?.value, 
              name: varbinds[9]?.value?.toString(),
              percentage: varbinds[5]?.value ? Math.round((varbinds[1]?.value / varbinds[5]?.value) * 100) : 0
            },
            magenta: { 
              level: varbinds[2]?.value, 
              capacity: varbinds[6]?.value, 
              name: varbinds[10]?.value?.toString(),
              percentage: varbinds[6]?.value ? Math.round((varbinds[2]?.value / varbinds[6]?.value) * 100) : 0
            },
            yellow: { 
              level: varbinds[3]?.value, 
              capacity: varbinds[7]?.value, 
              name: varbinds[11]?.value?.toString(),
              percentage: varbinds[7]?.value ? Math.round((varbinds[3]?.value / varbinds[7]?.value) * 100) : 0
            }
          }
        };
        resolve(results);
      }
    });
  });
};

module.exports = {
  testSnmpConnection,
  getPrinterMetrics,
  scanHPInkOids,
  PRINTER_OIDS
};