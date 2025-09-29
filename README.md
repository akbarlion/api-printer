# Printer Monitoring API

Backend API untuk sistem monitoring printer dengan SNMP dan JWT Authentication.

## Features

- **JWT Authentication** dengan Refresh Token
- **Role-based Access Control** (admin, operator, viewer)
- **SNMP Printer Monitoring** (polling setiap 30 detik)
- **Real-time Alert System**
- **Printer Metrics Tracking**
- **Auto Token Refresh**
- **Security Middleware**

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL/MariaDB
- **Authentication**: JWT + Refresh Token
- **SNMP**: net-snmp library
- **Security**: bcryptjs, helmet, cors

## Setup Database

1. Install MySQL/MariaDB
2. Create database dan tables:
```bash
mysql -u root -p < database/setup.sql
```

3. Insert sample data:
```bash
mysql -u root -p < database/seed.sql
```

4. (Optional) Add sample alerts:
```bash
mysql -u root -p < database/sample_alerts.sql
```

## Environment Setup

1. Copy `.env` file dan sesuaikan konfigurasi:
```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=printer_monitoring
DB_USER=root
DB_PASS=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# SNMP
SNMP_TIMEOUT=5000
SNMP_RETRIES=3
POLLING_INTERVAL=30000
```

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
- Role: `admin`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Printers
- `GET /api/printers` - Get all printers
- `POST /api/printers` - Add new printer
- `GET /api/printers/:id` - Get printer by ID
- `PUT /api/printers/:id` - Update printer
- `DELETE /api/printers/:id` - Delete printer
- `POST /api/printers/test` - Test SNMP connection

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/stats` - Get alert statistics
- `PUT /api/alerts/:id/acknowledge` - Acknowledge alert
- `PUT /api/alerts/:id/resolve` - Resolve alert
- `DELETE /api/alerts/:id` - Delete alert (admin only)

### SNMP
- `GET /api/snmp/test/:ip` - Test SNMP connection
- `GET /api/snmp/metrics/:ip` - Get printer metrics

## Authentication Flow

1. **Login**: User mendapat `accessToken` (15 menit) dan `refreshToken` (7 hari)
2. **Request**: Setiap request menggunakan `Authorization: Bearer {accessToken}`
3. **Auto Refresh**: Ketika `accessToken` expired, sistem otomatis refresh menggunakan `refreshToken`
4. **Logout**: Menghapus `refreshToken` dari database

## Role Permissions

- **Admin**: Full access ke semua endpoints
- **Operator**: Manage printers dan acknowledge alerts
- **Viewer**: Read-only access

## SNMP Monitoring

Sistem otomatis polling printer setiap 30 detik untuk:
- Toner/Ink levels
- Paper tray status
- Device status
- Page counter
- Connection status

### Alert Generation

Alert otomatis dibuat ketika:
- Toner/Ink level < 20%
- Paper tray empty
- Printer offline
- Device error

## Database Schema

- **users** - User accounts dengan role
- **printers** - Printer information
- **printermetrics** - Historical printer data
- **printeralerts** - Alert notifications
- **snmpprofiles** - SNMP configuration

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Security Features

- Password hashing dengan bcrypt
- JWT token dengan expiration
- Refresh token rotation
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention

## Monitoring

- Health check endpoint: `GET /health`
- Console logging untuk debugging
- Error handling middleware
- Database connection monitoring