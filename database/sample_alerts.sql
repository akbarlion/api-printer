-- Sample alerts data
USE printer_monitoring;

-- Temporarily disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Insert sample alerts with realistic scenarios
INSERT INTO printeralerts (id, printerId, printerName, alertType, severity, message, isAcknowledged, createdAt) VALUES 
(UUID(), UUID(), 'HP LaserJet Pro 1', 'toner_low', 'medium', 'Toner level is 15% - needs replacement soon', FALSE, NOW()),
(UUID(), UUID(), 'Canon Pixma 1', 'paper_empty', 'high', 'Paper tray is empty - refill required', FALSE, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(UUID(), UUID(), 'Epson WorkForce 1', 'offline', 'critical', 'Printer is offline - check network connection', FALSE, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(UUID(), UUID(), 'HP LaserJet Pro 1', 'error', 'high', 'Paper jam detected in tray 1', FALSE, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(UUID(), UUID(), 'Canon Pixma 1', 'toner_low', 'low', 'Cyan ink level is 25%', TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;