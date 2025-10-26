# Database Migration Guide

This guide will help you migrate from your local MongoDB database to a live production database.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Production Database

#### Option A: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Create a database user with read/write permissions
4. Get your connection string
5. Add it to your environment variables

#### Option B: Self-hosted MongoDB
1. Set up MongoDB on your server
2. Configure SSL/TLS
3. Create database user
4. Get connection string

### 3. Configure Environment Variables

Create `.env.local` file:
```bash
# Development (Local MongoDB)
MONGODB_URI=mongodb://localhost:27017/borrands

# Production (MongoDB Atlas)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/borrands?retryWrites=true&w=majority

# Alternative Production (Self-hosted)
# MONGODB_URI=mongodb://username:password@your-mongodb-host:27017/borrands?ssl=true&authSource=admin

# Other required variables...
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Run Database Migrations

```bash
# Check migration status
npm run migrate:status

# Apply all pending migrations
npm run migrate

# Check database health
npm run db:health
```

### 5. Migrate Data (if needed)

```bash
# Migrate from local to production database
npm run migrate:data mongodb://localhost:27017/borrands mongodb+srv://user:pass@cluster.mongodb.net/borrands
```

## 📋 Step-by-Step Migration Process

### Phase 1: Prepare Production Database

1. **Set up MongoDB Atlas cluster:**
   - Choose M0 (free tier) or M2+ for production
   - Select region closest to your users
   - Enable backup and monitoring

2. **Configure security:**
   - Create database user with appropriate permissions
   - Set up IP whitelist (0.0.0.0/0 for development, specific IPs for production)
   - Enable SSL/TLS

3. **Get connection string:**
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

### Phase 2: Update Environment Configuration

1. **Update `.env.local`:**
   ```bash
   # Comment out local database
   # MONGODB_URI=mongodb://localhost:27017/borrands
   
   # Add production database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/borrands?retryWrites=true&w=majority
   
   # Update other production settings
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

2. **Update production environment variables:**
   - Vercel: Add environment variables in dashboard
   - Other platforms: Set in your deployment configuration

### Phase 3: Run Database Setup

1. **Apply database migrations:**
   ```bash
   npm run migrate
   ```

2. **Verify database health:**
   ```bash
   npm run db:health
   ```

3. **Test application:**
   ```bash
   npm run dev
   ```

### Phase 4: Data Migration (if needed)

If you have existing data in your local database:

1. **Backup local data:**
   ```bash
   mongodump --uri="mongodb://localhost:27017/borrands" --out=./backup
   ```

2. **Migrate data:**
   ```bash
   npm run migrate:data mongodb://localhost:27017/borrands mongodb+srv://user:pass@cluster.mongodb.net/borrands
   ```

3. **Verify migration:**
   - Check document counts match
   - Test critical functionality
   - Verify data integrity

## 🔧 Database Performance Optimizations

### Indexes Added
The migration system automatically adds comprehensive indexes:

- **Users**: phone, university+role, active+verified
- **Restaurants**: university+approved+active, location (2dsphere), text search
- **Orders**: student+created, restaurant+status, rider+status
- **MenuItems**: restaurant+category, availability, text search
- **Riders**: online+available+active, location (2dsphere)
- **Categories**: restaurant+active, sort order
- **InventoryItems**: restaurant+category+name, status

### Connection Pool Settings
- **Development**: 10 max connections, 2 min connections
- **Production**: 20 max connections, 5 min connections
- **Timeouts**: 5s server selection, 45s socket, 10s connect
- **Retry**: Enabled for both reads and writes

## 🚨 Troubleshooting

### Common Issues

1. **Connection timeout:**
   ```bash
   # Check network connectivity
   ping cluster.mongodb.net
   
   # Verify connection string
   mongosh "mongodb+srv://username:password@cluster.mongodb.net/borrands"
   ```

2. **Authentication failed:**
   - Verify username/password
   - Check IP whitelist
   - Ensure user has proper permissions

3. **Migration fails:**
   ```bash
   # Check migration status
   npm run migrate:status
   
   # Rollback if needed
   npm run migrate:rollback
   ```

4. **Data migration issues:**
   - Check source database connectivity
   - Verify target database permissions
   - Review error logs for specific collection issues

### Health Check Endpoints

- **Database Health**: `GET /api/health/db`
- **Migration Status**: `npm run migrate:status`

## 📊 Monitoring

### Database Metrics to Monitor
- Connection pool usage
- Query performance
- Index usage
- Memory usage
- Disk usage

### Recommended Tools
- MongoDB Atlas monitoring (built-in)
- MongoDB Compass (GUI)
- Custom health check endpoints

## 🔒 Security Best Practices

1. **Use strong passwords** for database users
2. **Enable SSL/TLS** for all connections
3. **Restrict IP access** to known sources
4. **Regular backups** of production data
5. **Monitor access logs** for suspicious activity
6. **Rotate credentials** periodically

## 📝 Environment Variables Reference

```bash
# Required
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/borrands
JWT_SECRET=your-super-secret-jwt-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Optional Performance Tuning
DB_MAX_POOL_SIZE=20
DB_MIN_POOL_SIZE=5
DB_MAX_IDLE_TIME_MS=30000

# External Services
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

## 🎯 Next Steps

After successful migration:

1. **Set up monitoring** and alerting
2. **Configure automated backups**
3. **Set up staging environment**
4. **Implement database connection pooling** (if not using Atlas)
5. **Add Redis caching** for better performance
6. **Set up database replication** for high availability

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review MongoDB Atlas documentation
3. Check application logs for specific errors
4. Verify environment variable configuration
5. Test database connectivity manually

---

**Note**: Always test migrations in a staging environment before applying to production!
