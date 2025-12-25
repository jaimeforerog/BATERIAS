# Guía de Despliegue en Render.com

Esta guía te ayudará a publicar tu proyecto Baterias en Render.com de forma gratuita.

## Prerrequisitos

1. Cuenta en [Render.com](https://render.com) (puedes usar tu cuenta de GitHub)
2. Código subido a GitHub (ya hecho ✅)

## Pasos para Desplegar

### Opción 1: Despliegue Automático con Blueprint (Recomendado)

1. **Accede a Render**
   - Ve a https://render.com
   - Inicia sesión con tu cuenta de GitHub

2. **Crear Nuevo Blueprint**
   - Click en "New +" → "Blueprint"
   - Conecta tu repositorio: `jaimeforerog/BATERIAS`
   - Render detectará automáticamente el archivo `render.yaml`

3. **Configurar Variables de Entorno (opcional)**
   - Render creará automáticamente:
     - Base de datos PostgreSQL (gratuita)
     - Backend API
     - Frontend

4. **Desplegar**
   - Click en "Apply"
   - Espera 5-10 minutos mientras Render construye y despliega tu aplicación

5. **Acceder a tu aplicación**
   - Frontend: `https://baterias-frontend.onrender.com`
   - Backend API: `https://baterias-api.onrender.com`
   - Swagger: `https://baterias-api.onrender.com/swagger`

### Opción 2: Despliegue Manual

#### Paso 1: Crear Base de Datos

1. En Render Dashboard, click "New +" → "PostgreSQL"
2. Configuración:
   - Name: `baterias-db`
   - Database: `baterias`
   - User: `baterias`
   - Plan: **Free**
3. Click "Create Database"
4. Guarda la **Internal Connection String**

#### Paso 2: Desplegar Backend API

1. Click "New +" → "Web Service"
2. Conecta tu repositorio de GitHub
3. Configuración:
   - Name: `baterias-api`
   - Runtime: **Docker**
   - Dockerfile Path: `./Dockerfile`
   - Plan: **Free**
4. Variables de Entorno:
   ```
   ASPNETCORE_ENVIRONMENT=Production
   DATABASE_URL=[Pega aquí tu connection string de PostgreSQL]
   ```
5. Health Check Path: `/health`
6. Click "Create Web Service"

#### Paso 3: Desplegar Frontend

1. Click "New +" → "Web Service"
2. Selecciona el mismo repositorio
3. Configuración:
   - Name: `baterias-frontend`
   - Runtime: **Docker**
   - Dockerfile Path: `./frontend/Dockerfile`
   - Root Directory: `frontend`
   - Plan: **Free**
4. Variables de Entorno:
   ```
   VITE_API_URL=https://baterias-api.onrender.com
   ```
5. Click "Create Web Service"

## Características del Plan Gratuito

- ✅ SSL/HTTPS automático
- ✅ 750 horas de compute por mes
- ✅ PostgreSQL 15GB de almacenamiento
- ✅ Despliegue automático desde GitHub
- ⚠️ Los servicios se "duermen" después de 15 minutos de inactividad
- ⚠️ Primera solicitud puede tardar 30-50 segundos en "despertar"

## Alternativas Gratuitas

### Railway.app
- Similar a Render
- $5 de crédito gratis por mes
- Límite de 500 horas/mes

### Fly.io
- Más técnico pero muy flexible
- 3 VMs gratuitas
- PostgreSQL incluido

### Azure App Service
- Tier F1 gratuito para .NET
- 1GB RAM, 1GB storage

## Solución de Problemas

### El backend no inicia
- Verifica que la variable `DATABASE_URL` esté configurada correctamente
- Revisa los logs en Render Dashboard

### El frontend no se conecta al backend
- Verifica que `VITE_API_URL` apunte a la URL correcta del backend
- Revisa la consola del navegador para errores CORS

### La base de datos está vacía
- Las migraciones de Entity Framework deberían ejecutarse automáticamente
- Si no, puedes ejecutarlas manualmente desde el shell de Render

## Comandos Útiles

### Ver logs en tiempo real
```bash
render logs -f baterias-api
```

### SSH al contenedor (si es necesario)
Desde Render Dashboard → Service → Shell

## Actualizar la Aplicación

Cada vez que hagas `git push` a la rama `main`:
- Render detectará los cambios automáticamente
- Reconstruirá y redesplegarálos servicios
- El proceso toma ~5-10 minutos

## Soporte

- Documentación oficial: https://render.com/docs
- Discord de Render: https://render.com/community

---

**¡Listo!** Tu aplicación debería estar en línea en aproximadamente 10 minutos. 🚀
