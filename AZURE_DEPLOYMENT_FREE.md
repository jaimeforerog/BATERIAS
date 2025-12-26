# Guía de Despliegue Gratuito en Azure

Esta guía te ayudará a desplegar tu aplicación Baterias completamente **GRATIS** en Azure.

## Arquitectura del Despliegue Gratuito

- **Frontend**: Azure Static Web Apps (Tier Gratuito - permanente)
- **Backend**: Azure App Service (Plan F1 - gratuito con limitaciones)
- **Base de datos**: Neon PostgreSQL (Tier Gratuito - 512 MB)

---

## Paso 1: Crear Base de Datos PostgreSQL Gratuita en Neon

### 1.1 Crear cuenta en Neon
1. Ve a https://neon.tech
2. Regístrate con GitHub (gratis, sin tarjeta de crédito)
3. Crea un nuevo proyecto llamado `baterias`
4. Selecciona la región más cercana a tu ubicación

### 1.2 Obtener string de conexión
1. En el dashboard de Neon, copia el **Connection String**
2. Debería verse así:
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/baterias?sslmode=require
   ```
3. **Guarda este string** - lo necesitarás más adelante

### 1.3 Crear la base de datos
Neon crea automáticamente la base de datos inicial. Asegúrate de que se llame `baterias` o actualiza el nombre en tu connection string.

---

## Paso 2: Crear Azure Static Web App (Frontend)

### 2.1 Crear el recurso
1. Ve al [Portal de Azure](https://portal.azure.com)
2. Clic en "Create a resource" → Busca "Static Web App"
3. Clic en "Create"

### 2.2 Configuración
- **Subscription**: Tu suscripción de Azure
- **Resource Group**: Crea uno nuevo llamado `rg-baterias`
- **Name**: `baterias-frontend`
- **Plan type**: **Free** ⚠️ ¡IMPORTANTE!
- **Region**: Selecciona la más cercana
- **Deployment details**:
  - **Source**: GitHub
  - **Organization**: Tu usuario de GitHub
  - **Repository**: Selecciona tu repositorio `Baterias`
  - **Branch**: `main`
- **Build Details**:
  - **Build Presets**: Custom
  - **App location**: `/frontend`
  - **Api location**: (dejar vacío)
  - **Output location**: `dist`

### 2.3 Finalizar
1. Clic en "Review + create"
2. Clic en "Create"
3. **IMPORTANTE**: Copia el **Deployment Token** que aparece
   - Ve a tu Static Web App → Settings → Configuration → Copy deployment token
   - Lo necesitarás para GitHub Actions

---

## Paso 3: Crear Azure App Service (Backend)

### 3.1 Crear el recurso
1. En el Portal de Azure, clic en "Create a resource"
2. Busca "Web App"
3. Clic en "Create"

### 3.2 Configuración básica
- **Subscription**: Tu suscripción de Azure
- **Resource Group**: `rg-baterias` (el mismo que creaste)
- **Name**: `baterias-api` (debe ser único globalmente)
- **Publish**: **Docker Container** ⚠️ ¡IMPORTANTE!
- **Operating System**: Linux
- **Region**: La misma que seleccionaste para el frontend

### 3.3 Configuración del plan (MUY IMPORTANTE)
- **Linux Plan**: Crea uno nuevo llamado `plan-baterias-free`
- **Pricing plan**:
  - Clic en "Explore pricing plans"
  - Selecciona la pestaña "Dev/Test"
  - Selecciona **F1 (Free)** ⚠️ ¡GRATIS!
  - Clic en "Select"

### 3.4 Configuración de Docker (por ahora dejarlo en blanco)
- **Options**: Single Container
- **Image Source**: Docker Hub
- **Access Type**: Public
- **Image and tag**: `nginx:latest` (temporal, lo cambiaremos después)

### 3.5 Finalizar
1. Clic en "Review + create"
2. Clic en "Create"
3. Espera a que se despliegue (2-3 minutos)

---

## Paso 4: Configurar Container Registry (Opcional pero Recomendado)

Si quieres usar Azure Container Registry (también hay tier gratuito):

### 4.1 Crear ACR
1. En Azure Portal → "Create a resource" → "Container Registry"
2. Configuración:
   - **Resource Group**: `rg-baterias`
   - **Registry name**: `bateriasacr` (debe ser único)
   - **Location**: La misma región
   - **SKU**: **Basic** (es el más barato, ~$5/mes)

⚠️ **ALTERNATIVA GRATUITA**: Puedes usar **GitHub Container Registry** (GHCR) que es 100% gratis para repositorios públicos.

---

## Paso 5: Configurar Variables de Entorno

### 5.1 En Azure App Service (Backend)
1. Ve a tu App Service `baterias-api`
2. En el menú lateral, ve a **Configuration**
3. Agrega estas **Application Settings**:

| Name | Value |
|------|-------|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ConnectionStrings__BatteryDatabase` | `TU_CONNECTION_STRING_DE_NEON` |
| `WEBSITES_PORT` | `8080` |
| `AllowedOrigins__0` | `https://baterias-frontend.azurestaticapps.net` |

4. Clic en "Save"

### 5.2 En Azure Static Web App (Frontend)
1. Ve a tu Static Web App `baterias-frontend`
2. En el menú lateral, ve a **Configuration**
3. Agrega esta variable:

| Name | Value |
|------|-------|
| `VITE_API_BASE_URL` | `https://baterias-api.azurewebsites.net` |

4. Clic en "Save"

---

## Paso 6: Configurar GitHub Secrets

Necesitas agregar estos secretos a tu repositorio de GitHub para que los workflows funcionen:

### 6.1 Ir a GitHub Settings
1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Clic en "New repository secret"

### 6.2 Agregar estos secretos:

#### Para Static Web App (Frontend):
- **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
- **Value**: El token que copiaste en el Paso 2.3

#### Para App Service (Backend):

**Opción A: Usar Publish Profile (más fácil)**
1. En Azure Portal, ve a tu App Service `baterias-api`
2. Clic en "Get publish profile" (descargará un archivo .xml)
3. Abre el archivo y copia TODO el contenido
4. Crea un secret:
   - **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - **Value**: Pega el contenido del archivo

**Opción B: Usar Container Registry (si creaste ACR)**
- `AZURE_REGISTRY_LOGIN_SERVER`: `bateriasacr.azurecr.io`
- `AZURE_REGISTRY_USERNAME`: (lo encuentras en ACR → Access keys)
- `AZURE_REGISTRY_PASSWORD`: (lo encuentras en ACR → Access keys)

#### Variables adicionales:
- **Name**: `VITE_API_BASE_URL`
- **Value**: `https://baterias-api.azurewebsites.net`

---

## Paso 7: Actualizar Workflow de Backend

El workflow actual usa Container Registry. Si quieres usar el método más simple (Publish Profile), necesitas actualizar el workflow.

Hay dos opciones:

### Opción A: Usar Publish Profile (MÁS SIMPLE - Recomendado para F1)
Actualiza `.github/workflows/azure-backend.yml` para usar deployment directo sin Docker Registry.

### Opción B: Continuar con Container Registry
Mantén el workflow actual pero necesitas:
1. Habilitar "Admin user" en tu ACR
2. Configurar los secretos correctamente
3. Actualizar el App Service para usar imágenes de tu ACR

**Te recomiendo la Opción A para empezar** ya que es más simple y funciona mejor con el tier gratuito.

---

## Paso 8: Desplegar

### 8.1 Hacer push a main
Una vez que tengas todo configurado:

```bash
git add .
git commit -m "Configure Azure deployment"
git push origin main
```

### 8.2 Monitorear el despliegue
1. Ve a tu repositorio en GitHub
2. Clic en la pestaña "Actions"
3. Verás dos workflows ejecutándose:
   - `Deploy Frontend to Azure Static Web Apps`
   - `Deploy Backend to Azure App Service`

### 8.3 Verificar
Una vez completados los workflows:

- **Frontend**: https://baterias-frontend.azurestaticapps.net
- **Backend**: https://baterias-api.azurewebsites.net
- **API Health**: https://baterias-api.azurewebsites.net/health

---

## Limitaciones del Tier Gratuito

### Azure App Service F1 (Backend):
- ⚠️ **60 minutos de CPU por día**
- ⚠️ **1 GB de RAM**
- ⚠️ Sin custom domains SSL
- ⚠️ La app se "duerme" después de 20 min de inactividad
- Solo para desarrollo/pruebas

### Azure Static Web Apps (Frontend):
- ✅ 100 GB bandwidth/mes (más que suficiente)
- ✅ SSL gratuito
- ✅ Custom domains
- ✅ Sin límite de sleep

### Neon PostgreSQL:
- ✅ 512 MB de almacenamiento
- ⚠️ La base de datos se suspende después de 5 min de inactividad
- ⚠️ Conexiones limitadas

---

## Alternativas si el F1 no es suficiente

Si necesitas más recursos pero sigues queriendo ahorrar:

1. **Azure for Students**: $100 créditos gratis (sin tarjeta)
2. **Azure Free Trial**: $200 créditos por 30 días
3. **Render.com**: Ya tienes la configuración en `render.yaml`
4. **Railway**: Hasta $5/mes gratis
5. **Fly.io**: Generous free tier con mejor performance

---

## Próximos Pasos

1. ✅ Configura los recursos en Azure (Pasos 1-3)
2. ✅ Agrega los secretos a GitHub (Paso 6)
3. ✅ Actualiza el workflow si es necesario (Paso 7)
4. ✅ Haz push y despliega (Paso 8)
5. 🔧 Monitorea el uso y ajusta según sea necesario

---

## Soporte

Si encuentras problemas:
- Revisa los logs en Azure Portal → App Service → Log stream
- Revisa los logs de GitHub Actions
- Verifica que todos los secretos estén configurados correctamente

---

## Notas Importantes

⚠️ **El tier F1 es limitado**. Si tu aplicación tiene mucho tráfico o procesos pesados, considera:
- Actualizar a un tier de pago después de probar
- Usar Render.com (ya tienes la configuración)
- Usar Azure for Students o Free Trial para obtener créditos

✅ **Para desarrollo y demos**, esta configuración gratuita es perfecta.
