# Guía de Despliegue en Microsoft Azure

Esta guía te ayudará a publicar tu proyecto Baterias en Azure de forma gratuita usando los servicios Free Tier.

## Arquitectura de Despliegue

- **Backend API**: Azure App Service (F1 Free Tier) con contenedor Docker
- **Frontend**: Azure Static Web Apps (Gratis)
- **Base de datos**: Azure Database for PostgreSQL - Flexible Server (Tier gratuito)
- **CI/CD**: GitHub Actions (incluido)

## Prerrequisitos

1. Cuenta de Azure (puedes crear una gratuita en https://azure.microsoft.com/free/)
   - $200 de crédito gratis por 30 días
   - Servicios gratuitos por 12 meses
   - Servicios siempre gratuitos (incluye los que usaremos)
2. Cuenta de GitHub (ya tienes el código subido ✅)

## Parte 1: Crear Recursos en Azure

### 1.1 Iniciar Sesión en Azure Portal

1. Ve a https://portal.azure.com
2. Inicia sesión con tu cuenta de Microsoft
3. Si es tu primera vez, acepta los términos y completa el registro

### 1.2 Crear un Grupo de Recursos

Un grupo de recursos contiene todos los servicios relacionados.

1. En Azure Portal, busca "Resource groups" en la barra de búsqueda
2. Click en **"+ Create"**
3. Configuración:
   - **Subscription**: Selecciona tu suscripción (Free Trial o Pay-As-You-Go)
   - **Resource group name**: `baterias-rg`
   - **Region**: `East US` (o la más cercana a ti)
4. Click en **"Review + create"** → **"Create"**

### 1.3 Crear Base de Datos PostgreSQL

1. Busca "Azure Database for PostgreSQL" en la barra de búsqueda
2. Click en **"+ Create"**
3. Selecciona **"Flexible server"**
4. Configuración:
   - **Subscription**: Tu suscripción
   - **Resource group**: `baterias-rg`
   - **Server name**: `baterias-db` (debe ser único globalmente)
   - **Region**: `East US` (mismo que el resource group)
   - **PostgreSQL version**: 15 o 16
   - **Workload type**: **Development**

5. En **"Compute + storage"**:
   - Click en **"Configure server"**
   - Compute tier: **Burstable**
   - Compute size: **Standard_B1ms** (1 vCore, 2GB RAM) - Gratis con créditos
   - Storage: **32 GiB** (mínimo)
   - Click en **"Save"**

6. En **"Authentication"**:
   - **Authentication method**: PostgreSQL authentication only
   - **Admin username**: `bateriaadmin`
   - **Password**: Crea una contraseña segura y **guárdala**

7. En **"Networking"**:
   - **Connectivity method**: Public access
   - ✅ **Allow public access from any Azure service within Azure to this server**
   - Click en **"+ Add current client IP address"** (para acceder desde tu PC)

8. Click en **"Review + create"** → **"Create"**
9. **Espera 5-10 minutos** mientras se crea

10. Una vez creada, ve al recurso y:
    - En el menú izquierdo, click en **"Connection strings"**
    - Copia la **"ADO.NET"** connection string
    - Guárdala en un lugar seguro (la necesitarás después)

### 1.4 Crear Azure Container Registry (ACR)

Necesitamos un registro para almacenar la imagen Docker del backend.

1. Busca "Container registries" en Azure Portal
2. Click en **"+ Create"**
3. Configuración:
   - **Resource group**: `baterias-rg`
   - **Registry name**: `bateriasregistry` (debe ser único, solo letras minúsculas y números)
   - **Location**: `East US`
   - **SKU**: **Basic** (el más económico, suficiente para nuestro uso)
4. Click en **"Review + create"** → **"Create"**

5. Una vez creado, ve al recurso:
   - En el menú izquierdo, click en **"Access keys"**
   - ✅ Habilita **"Admin user"**
   - Guarda:
     - **Login server**: `bateriasregistry.azurecr.io`
     - **Username**: el username mostrado
     - **Password**: una de las contraseñas mostradas

### 1.5 Crear Azure App Service (Backend)

1. Busca "App Services" en Azure Portal
2. Click en **"+ Create"** → **"Web App"**
3. En la pestaña **"Basics"**:
   - **Resource Group**: `baterias-rg`
   - **Name**: `baterias-api` (debe ser único globalmente)
   - **Publish**: **Docker Container**
   - **Operating System**: Linux
   - **Region**: `East US`

4. **App Service Plan**:
   - Click en **"Create new"**
   - Name: `baterias-plan`
   - Click en **"Change size"**
   - Selecciona **"Dev/Test"** → **"F1"** (Free) - 1GB RAM, 1GB storage
   - Click en **"Apply"**

5. Click en **"Next: Docker"**
6. En la pestaña **"Docker"**:
   - **Options**: Single Container
   - **Image Source**: Azure Container Registry
   - **Registry**: Selecciona `bateriasregistry`
   - **Image**: Deja en blanco por ahora (lo configuraremos con GitHub Actions)
   - **Tag**: latest

7. Click en **"Next: Networking"** → Deja los defaults
8. Click en **"Review + create"** → **"Create"**

9. Una vez creado, ve al recurso:
   - En el menú izquierdo, click en **"Configuration"**
   - En **"Application settings"**, click en **"+ New application setting"**
   - Agrega estas variables:

     | Name | Value |
     |------|-------|
     | `ASPNETCORE_ENVIRONMENT` | `Production` |
     | `DATABASE_URL` | La connection string de PostgreSQL que guardaste |
     | `WEBSITES_PORT` | `8080` |

   - Click en **"Save"** arriba
   - Click en **"Continue"** cuando pregunte si quieres reiniciar

10. En el menú izquierdo, click en **"Deployment Center"**:
    - Descarga el **"Publish profile"** (botón arriba)
    - Guárdalo (lo necesitarás para GitHub Actions)

### 1.6 Crear Azure Static Web App (Frontend)

1. Busca "Static Web Apps" en Azure Portal
2. Click en **"+ Create"**
3. Configuración:
   - **Resource Group**: `baterias-rg`
   - **Name**: `baterias-frontend`
   - **Plan type**: **Free**
   - **Region**: `East US 2` o el más cercano

4. En **"Deployment details"**:
   - **Source**: GitHub
   - Click en **"Sign in with GitHub"** y autoriza
   - **Organization**: Tu usuario de GitHub
   - **Repository**: `BATERIAS`
   - **Branch**: `main`

5. En **"Build Details"**:
   - **Build Presets**: Custom
   - **App location**: `/frontend`
   - **Api location**: (dejar vacío)
   - **Output location**: `dist`

6. Click en **"Review + create"** → **"Create"**

7. Azure automáticamente:
   - Creará un workflow de GitHub Actions en tu repositorio
   - Desplegará tu frontend
   - Te dará una URL (ej: `https://nice-desert-xxx.azurestaticapps.net`)

8. Una vez creado, ve al recurso:
   - En el menú izquierdo, click en **"Configuration"**
   - En la pestaña **"Application settings"**, click en **"+ Add"**
   - Agrega:
     - **Name**: `VITE_API_BASE_URL`
     - **Value**: `https://baterias-api.azurewebsites.net`
   - Click en **"Save"**

## Parte 2: Configurar GitHub Secrets

Para que GitHub Actions pueda desplegar automáticamente, necesita credenciales:

1. Ve a tu repositorio en GitHub: `https://github.com/jaimeforerog/BATERIAS`
2. Click en **"Settings"** → **"Secrets and variables"** → **"Actions"**
3. Click en **"New repository secret"** y agrega estos secrets:

| Name | Value | Dónde obtenerlo |
|------|-------|----------------|
| `AZURE_REGISTRY_LOGIN_SERVER` | `bateriasregistry.azurecr.io` | Azure Container Registry → Access keys |
| `AZURE_REGISTRY_USERNAME` | El username del ACR | Azure Container Registry → Access keys |
| `AZURE_REGISTRY_PASSWORD` | La password del ACR | Azure Container Registry → Access keys |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Contenido del archivo publish profile | Azure App Service → Deployment Center → Download publish profile |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Token de Static Web App | Azure Static Web App → Manage deployment token |
| `VITE_API_BASE_URL` | `https://baterias-api.azurewebsites.net` | URL de tu App Service |

## Parte 3: Desplegar

### 3.1 Actualizar CORS en el Backend

Primero, actualiza el archivo `appsettings.Production.json` con la URL real de tu frontend:

```json
{
  "AllowedOrigins": [
    "https://nice-desert-xxx.azurestaticapps.net",
    "http://localhost:5173"
  ]
}
```

Reemplaza `nice-desert-xxx` con tu URL real de Azure Static Web Apps.

### 3.2 Hacer Push para Desplegar

1. Haz commit de los cambios:
```bash
git add .
git commit -m "Configure Azure deployment"
git push origin main
```

2. GitHub Actions se ejecutará automáticamente:
   - Ve a tu repositorio → **"Actions"**
   - Verás dos workflows corriendo:
     - **Deploy Backend to Azure App Service**
     - **Deploy Frontend to Azure Static Web Apps**

3. Espera 10-15 minutos para que ambos completen

### 3.3 Verificar el Despliegue

**Backend:**
1. Abre: `https://baterias-api.azurewebsites.net/health`
   - Deberías ver: `Healthy`

2. Swagger: `https://baterias-api.azurewebsites.net/swagger`

**Frontend:**
1. Abre tu URL de Static Web App (ej: `https://nice-desert-xxx.azurestaticapps.net`)

## Costos y Límites del Tier Gratuito

### Azure App Service (F1 Free):
- ✅ 1GB RAM, 1GB storage
- ✅ 60 minutos de CPU por día
- ✅ SSL gratuito
- ⚠️ Se duerme después de 20 min de inactividad
- ⚠️ Primera carga puede tardar 30-60 segundos

### Azure Static Web Apps (Free):
- ✅ 100GB bandwidth/mes
- ✅ SSL gratuito
- ✅ CDN global incluido
- ✅ No se duerme

### Azure Database for PostgreSQL:
- Con $200 de créditos: **Gratis por 30 días**
- Después: ~$12-15/mes (Burstable B1ms)
- Alternativa gratuita: Usar base de datos externa (Supabase, ElephantSQL)

## Optimizaciones

### Reducir el tiempo de "despertar" del App Service:

En Azure Portal → App Service → Configuration:
```
WEBSITES_ENABLE_APP_SERVICE_STORAGE = true
```

### Habilitar Application Insights (monitoreo gratuito):

1. En App Service, ve a **"Application Insights"**
2. Click en **"Turn on Application Insights"**
3. Selecciona **"Create new resource"**
4. Click en **"Apply"**

## Alternativa: Base de Datos Externa Gratuita

Si no quieres pagar por PostgreSQL después de los créditos:

### Supabase (PostgreSQL gratuito):
1. Ve a https://supabase.com
2. Crea proyecto gratuito
3. Copia la connection string
4. Actualiza `DATABASE_URL` en App Service Configuration

### ElephantSQL:
1. Ve a https://www.elephantsql.com
2. Plan "Tiny Turtle" (20MB gratis)
3. Crea instancia
4. Copia URL y actualiza en App Service

## Solución de Problemas

### ❌ Backend no inicia:
- Ve a App Service → **"Log stream"** para ver logs en tiempo real
- Verifica que `DATABASE_URL` esté correctamente configurada

### ❌ Frontend no se conecta al backend:
- Verifica que `VITE_API_BASE_URL` esté configurada en Static Web App
- Verifica CORS en `appsettings.Production.json`

### ❌ Error de conexión a base de datos:
- Verifica que el App Service tenga acceso:
  - PostgreSQL → Networking → Firewall rules
  - Agrega regla: `0.0.0.0` - `255.255.255.255` (permite todas las IPs de Azure)

### ❌ GitHub Actions falla:
- Verifica que todos los secrets estén configurados correctamente
- Ve a Actions → Click en el workflow fallido → Revisa los logs

## Monitoreo

### Ver logs del backend:
```bash
# Desde Azure Portal
App Service → Log stream
```

### Ver métricas:
```bash
App Service → Metrics
- CPU Percentage
- Memory Percentage
- HTTP Server Errors
```

## Actualizar la Aplicación

Cada vez que hagas `git push` a la rama `main`:
- GitHub Actions desplegará automáticamente
- Backend: ~10-15 minutos
- Frontend: ~5 minutos

---

**¡Listo!** Tu aplicación estará en línea en:
- **Frontend**: `https://tu-static-app.azurestaticapps.net`
- **Backend**: `https://baterias-api.azurewebsites.net`
- **Swagger**: `https://baterias-api.azurewebsites.net/swagger`
