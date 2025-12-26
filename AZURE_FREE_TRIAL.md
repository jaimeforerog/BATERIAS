# Despliegue en Azure Free Trial ($200 Créditos)

## 🎁 ¿Qué Obtienes?

Con el **Azure Free Trial** obtienes:
- ✅ **$200 USD en créditos** válidos por 30 días
- ✅ Acceso a **todos los servicios de Azure**
- ✅ **Mejor rendimiento** que el tier gratuito
- ✅ **12 meses gratis** de servicios populares después del trial
- ⚠️ Requiere tarjeta de crédito (solo para verificación, no se cobra)

---

## 📊 Arquitectura Recomendada (Optimizada para $200)

### Opción 1: Balanceada (Recomendada - ~$15-20/mes)
- **Frontend**: Azure Static Web Apps (FREE)
- **Backend**: App Service B1 Basic (~$13/mes)
- **Base de datos**: Azure PostgreSQL Flexible Server - Burstable B1ms (~$12/mes)
- **Storage**: Azure Blob Storage (casi gratis)

**Total estimado**: ~$25/mes → **8 meses con $200**

### Opción 2: Alto Rendimiento (~$50-70/mes)
- **Frontend**: Azure Static Web Apps (FREE)
- **Backend**: App Service S1 Standard (~$70/mes)
- **Base de datos**: Azure PostgreSQL - General Purpose D2s v3 (~$100/mes)

**Total estimado**: ~$170/mes → **1+ mes completo con $200**

### Opción 3: Desarrollo Económico (~$5-10/mes)
- **Frontend**: Azure Static Web Apps (FREE)
- **Backend**: App Service B1 Basic (~$13/mes)
- **Base de datos**: Neon PostgreSQL (FREE externo)

**Total estimado**: ~$13/mes → **15 meses con $200**

---

## 🚀 Guía Paso a Paso

### Paso 1: Activar Azure Free Trial

1. Ve a https://azure.microsoft.com/free
2. Clic en **"Start free"**
3. Inicia sesión con tu cuenta Microsoft (o crea una)
4. Completa la verificación:
   - Verifica tu identidad (teléfono)
   - Ingresa tarjeta de crédito (solo verificación)
   - Acepta términos y condiciones
5. ✅ Recibirás $200 en créditos

---

### Paso 2: Crear Resource Group

1. En [Azure Portal](https://portal.azure.com)
2. Busca "Resource groups"
3. Clic en **"+ Create"**
4. Configuración:
   - **Subscription**: Azure subscription 1 (Free Trial)
   - **Resource group**: `rg-baterias-prod`
   - **Region**: `East US` (o la más cercana)
5. Clic en **"Review + create"** → **"Create"**

---

### Paso 3: Crear Azure Database for PostgreSQL

#### 3.1 Crear el servidor
1. En Azure Portal → "Create a resource"
2. Busca **"Azure Database for PostgreSQL"**
3. Selecciona **"Flexible server"** (recomendado)
4. Clic en **"Create"**

#### 3.2 Configuración Básica
- **Subscription**: Azure subscription 1 (Free Trial)
- **Resource group**: `rg-baterias-prod`
- **Server name**: `baterias-db-server` (debe ser único)
- **Region**: `East US` (misma que el Resource Group)
- **PostgreSQL version**: `16` (la más reciente)
- **Workload type**: Selecciona **"Development"** o **"Production small/medium"**

#### 3.3 Compute + Storage
**Para Opción Balanceada (Recomendada):**
- **Compute tier**: `Burstable`
- **Compute size**: `B1ms (1 vCore, 2 GiB RAM)` (~$12/mes)
- **Storage**: `32 GiB` (puedes ajustar después)
- **Backup retention**: 7 días

**Para Desarrollo Económico:**
- Usa **Neon** (externo, gratis) en lugar de Azure PostgreSQL

#### 3.4 Autenticación
- **Authentication method**: `PostgreSQL authentication only`
- **Admin username**: `baterias_admin`
- **Password**: Crea una contraseña segura y **guárdala**

#### 3.5 Networking
- **Connectivity method**: `Public access (allowed IP addresses)`
- ✅ Marca: **"Allow public access from any Azure service"**
- Agrega tu IP actual si quieres conectarte localmente

#### 3.6 Crear
- Clic en **"Review + create"**
- Revisa que el costo estimado esté dentro de tu presupuesto
- Clic en **"Create"**
- ⏱️ Espera 5-10 minutos

#### 3.7 Configuración Post-Creación
1. Ve a tu servidor PostgreSQL creado
2. En el menú lateral → **"Databases"**
3. Clic en **"+ Add"**
4. Nombre: `baterias`
5. Clic en **"Save"**

#### 3.8 Obtener Connection String
1. En tu servidor → **"Connect"**
2. Copia el connection string:
   ```
   postgresql://baterias_admin@baterias-db-server:PASSWORD@baterias-db-server.postgres.database.azure.com:5432/baterias?sslmode=require
   ```
3. Reemplaza `PASSWORD` con tu contraseña
4. **Guarda este string**

---

### Paso 4: Crear Azure Static Web App (Frontend)

1. En Azure Portal → "Create a resource"
2. Busca **"Static Web App"**
3. Clic en **"Create"**

#### Configuración:
- **Subscription**: Azure subscription 1 (Free Trial)
- **Resource group**: `rg-baterias-prod`
- **Name**: `baterias-frontend`
- **Plan type**: **Free** (sin costo)
- **Region**: `East US 2` (o automático)
- **Source**: `GitHub`
- Autoriza GitHub y selecciona:
  - **Organization**: Tu usuario
  - **Repository**: `Baterias`
  - **Branch**: `main`

#### Build Details:
- **Build Presets**: `Custom`
- **App location**: `/frontend`
- **Api location**: *(dejar vacío)*
- **Output location**: `dist`

#### Finalizar:
- Clic en **"Review + create"** → **"Create"**
- ⏱️ Espera 2-3 minutos

#### Obtener Deployment Token:
1. Ve a tu Static Web App
2. **Settings** → **Configuration**
3. Copia el **Deployment token**
4. **Guárdalo**

---

### Paso 5: Crear Azure App Service (Backend)

1. En Azure Portal → "Create a resource"
2. Busca **"Web App"**
3. Clic en **"Create"**

#### Configuración Básica:
- **Subscription**: Azure subscription 1 (Free Trial)
- **Resource group**: `rg-baterias-prod`
- **Name**: `baterias-api` (debe ser único globalmente)
- **Publish**: `Docker Container`
- **Operating System**: `Linux`
- **Region**: `East US` (misma región que la BD)

#### Pricing Plan:
**Para Opción Balanceada (Recomendada):**
- Clic en **"Create new"** pricing plan
- Name: `plan-baterias-prod`
- Clic en **"Explore pricing plans"**
- Selecciona **"Production"** tab
- Selecciona **"B1 Basic"** (~$13/mes)
  - 1 vCore
  - 1.75 GB RAM
  - 10 GB storage
- Clic en **"Select"**

**Para Alto Rendimiento:**
- Selecciona **"S1 Standard"** (~$70/mes)

#### Docker:
- **Options**: `Single Container`
- **Image Source**: `Docker Hub`
- **Access Type**: `Public`
- **Image and tag**: `nginx:latest` (temporal)

#### Finalizar:
- Clic en **"Review + create"** → **"Create"**
- ⏱️ Espera 2-3 minutos

---

### Paso 6: Configurar Variables de Entorno en Azure

#### 6.1 En App Service (Backend)

1. Ve a tu App Service `baterias-api`
2. En el menú lateral → **"Configuration"**
3. Pestaña **"Application settings"**
4. Agrega estas variables (clic en **"+ New application setting"**):

| Name | Value |
|------|-------|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ConnectionStrings__BatteryDatabase` | *(tu connection string de PostgreSQL)* |
| `WEBSITES_PORT` | `8080` |
| `AllowedOrigins__0` | `https://baterias-frontend.azurestaticapps.net` |
| `DOCKER_REGISTRY_SERVER_URL` | `https://ghcr.io` |

5. Clic en **"Save"** → **"Continue"**

#### 6.2 En Static Web App (Frontend)

1. Ve a tu Static Web App `baterias-frontend`
2. **Configuration** → **Application settings**
3. Agrega:

| Name | Value |
|------|-------|
| `VITE_API_BASE_URL` | `https://baterias-api.azurewebsites.net` |

4. Clic en **"Save"**

---

### Paso 7: Configurar GitHub Secrets

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Clic en **"New repository secret"**

#### Agrega estos secretos:

##### 1. Para Static Web App:
- **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
- **Value**: *(el token que guardaste en Paso 4)*

##### 2. Para App Service:
1. En Azure Portal, ve a tu App Service `baterias-api`
2. Clic en **"Get publish profile"** (descarga un archivo .xml)
3. Abre el archivo y copia **TODO** el contenido
4. En GitHub, crea el secret:
   - **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - **Value**: *(pega el contenido del archivo XML)*

##### 3. Variable de entorno:
- **Name**: `VITE_API_BASE_URL`
- **Value**: `https://baterias-api.azurewebsites.net`

---

### Paso 8: Configurar Permisos de GitHub Packages

Para que el workflow pueda publicar imágenes Docker en GitHub Container Registry:

1. En tu repositorio → **Settings**
2. **Actions** → **General**
3. Scroll hasta **"Workflow permissions"**
4. Selecciona **"Read and write permissions"**
5. ✅ Marca **"Allow GitHub Actions to create and approve pull requests"**
6. Clic en **"Save"**

---

### Paso 9: Desplegar

```bash
git add .
git commit -m "Configure Azure Free Trial deployment"
git push origin main
```

#### Monitorear:
1. Ve a GitHub → **Actions**
2. Verás dos workflows ejecutándose:
   - ✅ Deploy Frontend to Azure Static Web Apps
   - ✅ Deploy Backend to Azure App Service
3. Espera a que ambos completen (5-10 minutos)

---

### Paso 10: Verificar Despliegue

#### URLs:
- **Frontend**: https://baterias-frontend.azurestaticapps.net
- **Backend**: https://baterias-api.azurewebsites.net
- **Health Check**: https://baterias-api.azurewebsites.net/health
- **Swagger**: https://baterias-api.azurewebsites.net/swagger

#### Verificar BD:
Si tienes herramientas como **DBeaver** o **pgAdmin**:
1. Conecta usando el connection string
2. Verifica que la base de datos `baterias` exista

---

## 💰 Monitorear Costos

### Configurar Alertas de Presupuesto:

1. En Azure Portal → **Cost Management + Billing**
2. **Cost Management** → **Budgets**
3. Clic en **"+ Add"**
4. Configuración:
   - **Budget amount**: `$200`
   - **Alert conditions**:
     - 50% ($100)
     - 75% ($150)
     - 90% ($180)
   - **Alert recipients**: Tu email
5. Clic en **"Create"**

### Ver Costos Actuales:
1. **Cost Management + Billing** → **Cost analysis**
2. Filtra por **Resource group**: `rg-baterias-prod`
3. Revisa el costo diario/mensual

---

## 🎯 Estimación de Costos por Opción

### Opción 1: Balanceada (~$25/mes)
- Frontend (Static Web App): **$0**
- Backend (B1): **$13/mes**
- PostgreSQL (B1ms): **$12/mes**
- **Total**: ~$25/mes
- **Duración con $200**: ~8 meses

### Opción 2: Alto Rendimiento (~$170/mes)
- Frontend: **$0**
- Backend (S1): **$70/mes**
- PostgreSQL (D2s): **$100/mes**
- **Total**: ~$170/mes
- **Duración con $200**: ~35 días

### Opción 3: Económico (~$13/mes)
- Frontend: **$0**
- Backend (B1): **$13/mes**
- PostgreSQL (Neon): **$0**
- **Total**: ~$13/mes
- **Duración con $200**: ~15 meses

---

## 🔧 Configuración Post-Despliegue

### Habilitar HTTPS Redirect
1. Ve a tu App Service `baterias-api`
2. **Settings** → **Configuration**
3. **General settings** tab
4. **HTTPS Only**: **On**
5. Clic en **"Save"**

### Configurar Custom Domain (Opcional)
Si tienes un dominio:
1. Static Web App → **Custom domains**
2. Sigue el wizard para agregar tu dominio

### Habilitar Application Insights (Monitoreo)
1. Ve a tu App Service
2. **Monitoring** → **Application Insights**
3. Clic en **"Turn on Application Insights"**
4. Selecciona **"Create new"**
5. Esto te ayudará a ver logs y performance

---

## ⚠️ Después del Trial

Cuando se acaben los $200 o los 30 días:

### Opción 1: Continuar Pagando
- Azure convertirá tu cuenta a **Pay-As-You-Go**
- Seguirás pagando ~$25/mes (Opción Balanceada)

### Opción 2: Servicios Gratis Permanentes
Después del trial, tienes **12 meses gratis** de:
- 750 horas/mes de B1 App Service (Linux) - ¡Cubre 24/7!
- Pero PostgreSQL NO está incluido

Alternativas para BD gratis:
- Migrar a Neon (512 MB gratis)
- Usar Supabase (500 MB gratis)

### Opción 3: Migrar a Tier Gratuito
- Cambiar App Service a F1 (gratis permanente)
- Usar BD externa gratuita

---

## 🆘 Solución de Problemas

### El backend no se despliega
1. Revisa GitHub Actions → Ve los logs del workflow
2. Verifica que el Publish Profile sea correcto
3. Asegúrate de que los permisos de GitHub Packages estén activos

### Error de conexión a la BD
1. Verifica el connection string
2. En Azure PostgreSQL → **Networking**:
   - Asegúrate de que **"Allow Azure services"** esté habilitado
   - Agrega una regla de firewall si es necesario
3. Verifica que la BD `baterias` exista

### CORS errors en el frontend
1. Verifica `AllowedOrigins__0` en App Service Configuration
2. Asegúrate de que la URL sea exactamente: `https://baterias-frontend.azurestaticapps.net` (sin `/` al final)

### Costos muy altos
1. Revisa **Cost Analysis** en Azure
2. Considera cambiar a un tier más bajo:
   - PostgreSQL: B1ms en lugar de D2s
   - App Service: B1 en lugar de S1

---

## 📚 Recursos Útiles

- [Azure Free Trial](https://azure.microsoft.com/free)
- [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/)
- [Azure PostgreSQL Pricing](https://azure.microsoft.com/pricing/details/postgresql/)
- [App Service Pricing](https://azure.microsoft.com/pricing/details/app-service/)

---

## ✅ Checklist Final

- [ ] Free Trial activado ($200 disponibles)
- [ ] Resource Group creado
- [ ] PostgreSQL Flexible Server creado y BD `baterias` configurada
- [ ] Static Web App creado
- [ ] App Service creado con plan B1 o superior
- [ ] Variables de entorno configuradas en ambos servicios
- [ ] GitHub Secrets configurados
- [ ] Permisos de GitHub Packages habilitados
- [ ] Push a main realizado
- [ ] Workflows completados exitosamente
- [ ] URLs funcionando correctamente
- [ ] Alertas de presupuesto configuradas

---

¡Listo! Con el Azure Free Trial tendrás **mucho mejor rendimiento** y **varios meses** para probar tu aplicación en producción. 🚀
