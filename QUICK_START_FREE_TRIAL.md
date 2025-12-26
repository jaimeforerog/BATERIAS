# Inicio Rápido - Azure Free Trial ($200)

## 🎁 Qué Obtienes
- **$200 USD** en créditos (30 días)
- Acceso completo a Azure
- Mejor rendimiento que tier gratuito
- ~8 meses con configuración balanceada

---

## 🏗️ Arquitectura Recomendada (~$25/mes)

- **Frontend**: Azure Static Web Apps (FREE)
- **Backend**: App Service B1 (~$13/mes)
- **Base de datos**: Azure PostgreSQL B1ms (~$12/mes)

**Total**: ~$25/mes = **8 meses con $200**

---

## ⚡ 10 Pasos Rápidos

### 1️⃣ Activar Free Trial
- Ve a https://azure.microsoft.com/free
- Regístrate (requiere tarjeta para verificación)
- Obtén $200 en créditos

### 2️⃣ Crear Resource Group
```
Azure Portal → Resource groups → Create
Name: rg-baterias-prod
Region: East US
```

### 3️⃣ Crear PostgreSQL
```
Create Resource → Azure Database for PostgreSQL → Flexible server
Name: baterias-db-server
Tier: Burstable B1ms
Admin: baterias_admin
Password: [tu contraseña segura]
```

Después de crear:
- Agregar base de datos: `baterias`
- Copiar connection string

### 4️⃣ Crear Static Web App
```
Create Resource → Static Web App
Name: baterias-frontend
Plan: FREE
Source: GitHub → Tu repo
App location: /frontend
Output location: dist
```

Copiar Deployment Token

### 5️⃣ Crear App Service
```
Create Resource → Web App
Name: baterias-api
Publish: Docker Container
Plan: B1 Basic
Image: nginx:latest (temporal)
```

### 6️⃣ Configurar App Service
Configuration → Application settings:
```
ASPNETCORE_ENVIRONMENT = Production
ConnectionStrings__BatteryDatabase = [PostgreSQL connection string]
WEBSITES_PORT = 8080
AllowedOrigins__0 = https://baterias-frontend.azurestaticapps.net
DOCKER_REGISTRY_SERVER_URL = https://ghcr.io
```

### 7️⃣ Configurar Static Web App
Configuration → Application settings:
```
VITE_API_BASE_URL = https://baterias-api.azurewebsites.net
```

### 8️⃣ GitHub Secrets
Settings → Secrets and variables → Actions:
```
AZURE_STATIC_WEB_APPS_API_TOKEN = [del paso 4]
AZURE_WEBAPP_PUBLISH_PROFILE = [descargar del App Service]
VITE_API_BASE_URL = https://baterias-api.azurewebsites.net
```

### 9️⃣ Permisos GitHub
Settings → Actions → General:
- ✅ Read and write permissions

### 🔟 Desplegar
```bash
git add .
git commit -m "Deploy to Azure Free Trial"
git push origin main
```

---

## 🌐 URLs Resultantes

- **Frontend**: https://baterias-frontend.azurestaticapps.net
- **Backend**: https://baterias-api.azurewebsites.net
- **Health**: https://baterias-api.azurewebsites.net/health

---

## 💰 Configurar Alertas de Costo

```
Cost Management → Budgets → Add
Budget: $200
Alertas: 50%, 75%, 90%
Email: [tu email]
```

---

## 📊 Opciones de Costo

### Balanceada (~$25/mes) - RECOMENDADA ✅
- App Service: B1
- PostgreSQL: B1ms
- **Duración**: ~8 meses

### Económica (~$13/mes)
- App Service: B1
- PostgreSQL: Neon (externo gratis)
- **Duración**: ~15 meses

### Alto Rendimiento (~$170/mes)
- App Service: S1
- PostgreSQL: D2s v3
- **Duración**: ~1 mes

---

## 🆘 Problemas Comunes

### Backend no despliega
- Verifica Publish Profile en GitHub Secrets
- Revisa permisos de GitHub Packages

### Error de BD
- Networking → Allow Azure services: ON
- Verifica connection string

### CORS errors
- Verifica AllowedOrigins__0 sin `/` al final

---

## 📖 Guía Completa

Ver `AZURE_FREE_TRIAL.md` para instrucciones detalladas

---

## ⚠️ Después de 30 días

Opciones:
1. Continuar pagando (~$25/mes)
2. Migrar a tier gratuito (F1 + Neon)
3. Aprovechar 12 meses gratis de B1 App Service

---

## ✅ Ventajas vs Tier Gratuito

| Característica | Free Trial (B1) | Tier F1 Gratuito |
|----------------|-----------------|------------------|
| CPU | Sin límite | 60 min/día |
| RAM | 1.75 GB | 1 GB |
| Sleep | No | Sí (20 min) |
| Rendimiento | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Base de datos | Azure PostgreSQL | Neon (externo) |
| Costo | ~$25/mes | $0 |

---

**¡Empieza ahora y aprovecha tus $200!** 🚀
