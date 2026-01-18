#!/bin/bash

# ASTROBSM Sales Platform - DigitalOcean Droplet Deployment Script
# Run this script on your DigitalOcean droplet

echo "🚀 Starting ASTROBSM Sales Platform Deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node installation
node --version
npm --version

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Create app directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/astrobsm
sudo chown -R $USER:$USER /var/www/astrobsm

# Clone repository (or pull if exists)
cd /var/www/astrobsm
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes..."
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone https://github.com/astrobsm/astrowebsales.git .
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file
echo "🔧 Creating environment file..."
cat > .env << 'EOF'
# Database Configuration (DigitalOcean PostgreSQL)
# Replace these values with your actual database credentials
DB_HOST=your-database-host.db.ondigitalocean.com
DB_USER=doadmin
DB_PASSWORD=your-database-password
DB_NAME=defaultdb
DB_PORT=25060
DB_SSL=true

# Server Configuration
PORT=5000
NODE_ENV=production
EOF

echo "⚠️  IMPORTANT: Edit the .env file with your actual database credentials!"
echo "   Run: nano .env"
read -p "Press Enter after you have updated the .env file..."

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Setup PM2 ecosystem file
echo "🔧 Creating PM2 ecosystem file..."
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'astrobsm',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_file: '.env'
  }]
};
EOF

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 delete astrobsm 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

# Configure Nginx
echo "🔧 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/astrobsm << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# Enable site and restart Nginx
sudo ln -sf /etc/nginx/sites-available/astrobsm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo ""
echo "✅ Deployment Complete!"
echo "================================"
echo "🌐 Your app is now running at: http://$(curl -s ifconfig.me)"
echo "📊 PM2 status: pm2 status"
echo "📋 View logs: pm2 logs astrobsm"
echo "🔄 Restart app: pm2 restart astrobsm"
echo ""
echo "Next steps:"
echo "1. Point your domain to this IP: $(curl -s ifconfig.me)"
echo "2. Setup SSL with: sudo certbot --nginx"
echo "================================"
