#!/bin/bash
# Azure Deployment Script for CloudGuard AI
set -e

# Support region parameter or default to centralindia for Indian student subscriptions
LOCATION="${1:-centralindia}"
RESOURCE_GROUP="rg-cloudguard-ai"
ACR_NAME="acrcloudguard$RANDOM"
APP_SERVICE_PLAN="plan-cloudguard"
WEB_APP_NAME="app-cloudguard-ai-$RANDOM"

echo "=== 🚀 CloudGuard AI Azure Deployment Starting ==="
echo "[Azure] Target Region: $LOCATION"

# 1. Create Azure Resource Group
echo "[Azure] Creating Resource Group '$RESOURCE_GROUP' in $LOCATION..."
az group create --name $RESOURCE_GROUP --location "$LOCATION"

# 2. Create Azure Container Registry (ACR)
echo "[Azure] Creating Container Registry '$ACR_NAME' in $LOCATION..."
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true --location "$LOCATION"

# 3. Build & Push Container Image to ACR
echo "[Azure] Building & Pushing Docker image to ACR..."
az acr build --registry $ACR_NAME --image cloudguard-ai:latest .

# 4. Create App Service Plan
echo "[Azure] Creating App Service Plan (B1 Linux) in $LOCATION..."
az appservice plan create --name $APP_SERVICE_PLAN --resource-group $RESOURCE_GROUP --sku B1 --is-linux --location "$LOCATION"

# 5. Create Web App for Containers
echo "[Azure] Deploying Web App '$WEB_APP_NAME'..."
az webapp create --resource-group $RESOURCE_GROUP --plan $APP_SERVICE_PLAN --name $WEB_APP_NAME --deployment-container-image-name $ACR_NAME.azurecr.io/cloudguard-ai:latest

# 6. Configure App Settings
echo "[Azure] Setting Web App environment variables..."
az webapp config appsettings set --resource-group $RESOURCE_GROUP --name $WEB_APP_NAME --settings WEBSITES_PORT=8000

echo "=== ✅ Deployment Complete ==="
echo "CloudGuard AI is live at: https://$WEB_APP_NAME.azurewebsites.net"

