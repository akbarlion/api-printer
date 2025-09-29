const axios = require('axios');

class HPWebService {
  static async getInkLevels(ipAddress) {
    try {
      const url = `http://${ipAddress}/DevMgmt/ConsumableConfigDyn.xml`;

      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      return this.parseXMLData(response.data);
    } catch (error) {
      console.error('HP Web Service error:', error.message);
      throw error;
    }
  }

  static parseXMLData(xmlString) {
    try {
      const inkLevels = {
        black: null,
        cyan: null,
        magenta: null,
        yellow: null
      };

      // Extract ConsumableLabelCode and ConsumablePercentageLevelRemaining pairs
      const labelRegex = /<dd:ConsumableLabelCode>([^<]+)<\/dd:ConsumableLabelCode>/g;
      const levelRegex = /<dd:ConsumablePercentageLevelRemaining>([^<]+)<\/dd:ConsumablePercentageLevelRemaining>/g;

      const labels = [];
      const levels = [];

      let labelMatch;
      while ((labelMatch = labelRegex.exec(xmlString)) !== null) {
        labels.push(labelMatch[1]);
      }

      let levelMatch;
      while ((levelMatch = levelRegex.exec(xmlString)) !== null) {
        levels.push(parseInt(levelMatch[1]) || 0);
      }

      // Debug logging
      console.log('Parsed labels:', labels);
      console.log('Parsed levels:', levels);
      
      // Match labels with levels - prioritize first occurrence (cartridge over tank)
      for (let i = 0; i < labels.length && i < levels.length; i++) {
        const label = labels[i];
        const level = levels[i];

        switch (label) {
          case 'K':
            if (inkLevels.black === null) inkLevels.black = level; // Only set if not already set
            break;
          case 'C':
            if (inkLevels.cyan === null) inkLevels.cyan = level;
            break;
          case 'M':
            if (inkLevels.magenta === null) inkLevels.magenta = level;
            break;
          case 'Y':
            if (inkLevels.yellow === null) inkLevels.yellow = level;
            break;
          case 'CMY':
            // CMY cartridge - use for all colors if individual not set
            if (inkLevels.cyan === null) inkLevels.cyan = level;
            if (inkLevels.magenta === null) inkLevels.magenta = level;
            if (inkLevels.yellow === null) inkLevels.yellow = level;
            break;
        }
      }
      
      console.log('Final ink levels:', inkLevels);

      return {
        success: true,
        data: {
          blackLevel: inkLevels.black,
          cyanLevel: inkLevels.cyan,
          magentaLevel: inkLevels.magenta,
          yellowLevel: inkLevels.yellow,
          tonerLevel: null,
          printerType: 'inkjet',
          timestamp: new Date()
        }
      };
    } catch (error) {
      console.error('Error parsing XML data:', error);
      return {
        success: false,
        error: 'Failed to parse XML data'
      };
    }
  }
}

module.exports = HPWebService;