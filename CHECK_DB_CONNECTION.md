# How to Check Database Connection

## Quick Test Methods

### 1. Test via Command Line
```bash
mysql -h borrands.com.ng -P 3306 -u borrands_Temi -p'Amanillah12' -e "SELECT 'Connection OK' AS Status;"
```

### 2. Test via Node.js
```bash
node -e "const mysql = require('mysql2/promise'); (async () => { const conn = await mysql.createConnection({ host: 'borrands.com.ng', port: 3306, user: 'borrands_Temi', password: 'Amanillah12', database: 'borrands_Orderup' }); console.log('✅ Connected'); await conn.end(); })();"
```

### 3. Test via API (when server is running)
```bash
curl http://localhost:3000/api/health/db
```

### 4. Test Port Connectivity
```bash
nc -zv borrands.com.ng 3306
# or
telnet borrands.com.ng 3306
```

## If Connection Fails

1. **Check if database server is running** - Contact your hosting provider
2. **Check firewall** - The server might block external connections
3. **Check credentials** - Verify username/password are correct
4. **Check database name** - Make sure `borrands_Orderup` exists

## Current Configuration

- **Host:** borrands.com.ng
- **Port:** 3306
- **Database:** borrands_Orderup
- **Username:** borrands_Temi
- **Connection String:** `mysql://borrands_Temi:Amanillah12@borrands.com.ng:3306/borrands_Orderup?connection_limit=10&connect_timeout=10`
