-- Sample data untuk testing
USE printer_monitoring;

-- Insert sample users (password: admin123 for all)
INSERT INTO Users (username, email, password, role) VALUES 
('admin', 'admin@company.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Z8W4uDUO1V.jF1uYnTA.PfSROxtHO', 'admin'),
('operator1', 'operator@company.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Z8W4uDUO1V.jF1uYnTA.PfSROxtHO', 'operator'),
('viewer1', 'viewer@company.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8Z8W4uDUO1V.jF1uYnTA.PfSROxtHO', 'viewer');

-- Insert sample printers
INSERT INTO Printers (name, ipAddress, model, location, status) VALUES 
('HP LaserJet Pro 1', '192.168.1.100', 'HP LaserJet Pro M404dn', 'Office Floor 1', 'online'),
('Canon Pixma 1', '192.168.1.101', 'Canon PIXMA G3010', 'Office Floor 2', 'online'),
('Epson WorkForce 1', '192.168.1.102', 'Epson WorkForce Pro WF-3720', 'Meeting Room A', 'offline');

-- Insert sample SNMP profiles
INSERT INTO SNMPProfiles (name, version, community) VALUES 
('hp_profile', '2c', 'public'),
('canon_profile', '2c', 'public'),
('secure_profile', '3', NULL);