# Printer Monitoring API

Backend API untuk sistem monitoring printer dengan SNMP.

## Setup Database

1. Install MySQL/MariaDB
2. Run setup script:
```bash
mysql -u root -p < database/setup.sql
```

3. (Optional) Insert sample data:
```bash
mysql -u root -p < database/seed.sql
```

## Environment Setup

1. Copy `.env` file dan sesuaikan konfigurasi database
2. Install dependencies:
```bash
npm install
```

3. Start server:
```bash
npm run dev
```

## Default Login

- Username: `admin`
- Password: `admin123`

## API Endpoints

- `POST /api/auth/login` - Login
- `GET /api/printers` - Get all printers
- `POST /api/printers` - Add printer
- `PUT /api/printers/:id` - Update printer
- `DELETE /api/printers/:id` - Delete printer
- `POST /api/printers/test` - Test SNMP connection

## Features

- JWT Authentication
- SNMP Polling (30 detik interval)
- Real-time printer monitoring
- Alert system
- Role-based access (admin, operator, viewer)