# Inicio Rápido - Despliegue Gratuito en Azure

## Resumen de 5 Pasos

### 1️⃣ Crear Base de Datos PostgreSQL Gratis
- Ve a https://neon.tech
- Regístrate (gratis, sin tarjeta)
- Crea proyecto `baterias`
- Copia el **Connection String**

### 2️⃣ Crear Azure Static Web App (Frontend)
En [Azure Portal](https://portal.azure.com):
- Create Resource → Static Web App
- Name: `baterias-frontend`
- Plan: **FREE**
- Source: GitHub → Selecciona tu repo
- App location: `/frontend`
- Output location: `dist`
- Copia el **Deployment Token**

### 3️⃣ Crear Azure App Service (Backend)
En Azure Portal:
- Create Resource → Web App
- Name: `baterias-api`
- Publish: **Docker Container**
- OS: Linux
- Plan: **F1 (FREE)**
- Image: `nginx:latest` (temporal)

### 4️⃣ Configurar Secrets en GitHub
Settings → Secrets and variables → Actions → New secret:

```
AZURE_STATIC_WEB_APPS_API_TOKEN = [token del paso 2]
AZURE_WEBAPP_PUBLISH_PROFILE = [descárgalo del App Service]
VITE_API_BASE_URL = https://baterias-api.azurewebsites.net
```

### 5️⃣ Configurar Variables en Azure

**En App Service (`baterias-api`)** → Configuration:
```
ASPNETCORE_ENVIRONMENT = Production
ConnectionStrings__BatteryDatabase = [tu connection string de Neon]
WEBSITES_PORT = 8080
AllowedOrigins__0 = https://baterias-frontend.azurestaticapps.net
```

**En Static Web App (`baterias-frontend`)** → Configuration:
```
VITE_API_BASE_URL = https://baterias-api.azurewebsites.net
```

## 🚀 Desplegar

```bash
git add .
git commit -m "Configure Azure deployment"
git push origin main
```

Ve a GitHub → Actions para ver el progreso.

## 🌐 URLs

- **Frontend**: https://baterias-frontend.azurestaticapps.net
- **Backend**: https://baterias-api.azurewebsites.net
- **Health Check**: https://baterias-api.azurewebsites.net/health

## ⚠️ Limitaciones del Tier Gratuito

- App Service F1: 60 min CPU/día, 1 GB RAM
- Se duerme después de 20 min de inactividad
- Solo para desarrollo/pruebas

## 📖 Guía Completa

Para instrucciones detalladas, consulta: `AZURE_DEPLOYMENT_FREE.md`

## 🆘 Problemas Comunes

### El backend no inicia
- Verifica que `WEBSITES_PORT` esté configurado en `8080`
- Revisa los logs en Azure Portal → App Service → Log stream

### Error de CORS
- Verifica que `AllowedOrigins__0` tenga la URL correcta del frontend
- Asegúrate de que no tenga `/` al final

### Base de datos no conecta
- Verifica el connection string de Neon
- Asegúrate de que tenga `?sslmode=require` al final

### El workflow de GitHub falla
- Verifica que todos los secrets estén configurados
- Revisa que el Publish Profile sea el correcto
- Para repositorios privados, asegúrate de que el paquete GHCR tenga permisos
