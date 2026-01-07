#!/bin/bash

# MongoDB Backup Script
# Run this via cron for automated backups

BACKUP_DIR="/backups/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="designconnect_backup_${TIMESTAMP}"

mkdir -p ${BACKUP_DIR}

echo "🔄 Starting MongoDB backup: ${BACKUP_NAME}"

docker exec designconnect-mongo mongodump \
  --username=admin \
  --password=adminpassword \
  --authenticationDatabase=admin \
  --db=designconnect \
  --out=/tmp/${BACKUP_NAME}

docker cp designconnect-mongo:/tmp/${BACKUP_NAME} ${BACKUP_DIR}/

# Compress backup
cd ${BACKUP_DIR}
tar -czf ${BACKUP_NAME}.tar.gz ${BACKUP_NAME}
rm -rf ${BACKUP_NAME}

# Keep only last 7 days of backups
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
