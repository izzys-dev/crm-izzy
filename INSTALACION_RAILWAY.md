# 🚀 CRM CONVERSA - INSTALACIÓN EN RAILWAY

Tu CRM está completamente rediseñado con el estilo profesional de Conversa y listo para subir a la nube.

## ✨ NOVEDADES DEL REDISEÑO

✅ **Diseño Conversa profesional** - Colores: azul marino (#1a1e3f) + naranja (#f5a623)
✅ **Importar/Exportar clientes** - Soporte para Excel y CSV
✅ **Dashboard mejorado** - Métricas en tiempo real
✅ **Gestión de agentes** - Panel de administración
✅ **Interacciones completas** - Registra tipo, calidad, experiencia
✅ **Responsive** - Funciona en móvil, tablet y desktop

---

## 📋 REQUISITOS

- Cuenta en [railway.app](https://railway.app) (gratis, $5 USD crédito inicial)
- GitHub (opcional, pero recomendado)
- 15-20 minutos

---

## 🎯 PASO A PASO

### PASO 1: PREPARAR TUS ARCHIVOS

1. **Crea una carpeta en tu PC:**
   ```
   mi-crm-v2/
   ├── backend/
   ├── frontend/
   ├── docker-compose.yml
   └── init.sql (opcional)
   ```

2. **Reemplaza los archivos del frontend:**
   - Copia `App.js` → `frontend/src/App.js`
   - Copia `App.css` → `frontend/src/App.css`
   - Copia `frontend-package.json` → `frontend/package.json`

3. **El backend NO cambia** - Se mantiene igual

4. **Comprime en ZIP:**
   - Windows: Click derecho → "Enviar a" → "Carpeta comprimida"
   - Mac: Click derecho → "Comprimir"
   - Resultado: `mi-crm-v2.zip`

---

### PASO 2: REGISTRARSE EN RAILWAY

1. Ve a [railway.app](https://railway.app)
2. Click "Sign up"
3. Elige: **"Sign up with GitHub"** (más fácil)
4. Completa el registro

---

### PASO 3: CREAR PROYECTO EN RAILWAY

1. En Railway dashboard, click **"New Project"**
2. Opción: **"Deploy from Repo"** o **"Create Empty"**

**Si eliges "Deploy from Repo":**
- Conecta GitHub
- Crea un repositorio privado con tu código
- Railway lo detecta automáticamente

**Si eliges "Create Empty":**
- Click **"Create Empty"**
- Luego subimos el ZIP

---

### PASO 4: AGREGAR SERVICIOS

#### A) Base de Datos PostgreSQL

1. Click **"+ Add Service"**
2. Busca: **"PostgreSQL"**
3. Click **"Add PostgreSQL"**
4. Railway crea la BD automáticamente ✅

#### B) Backend

1. Click **"+ Add Service"** → **"Empty Service"**
2. Nombre: `backend`
3. Sube tu carpeta `backend/` con un Dockerfile
4. Railway detecta Node.js automáticamente

#### C) Frontend

1. Click **"+ Add Service"** → **"Empty Service"**
2. Nombre: `frontend`
3. Sube tu carpeta `frontend/`
4. Railway crea todo

---

### PASO 5: CONFIGURAR VARIABLES DE ENTORNO

En Railway, para cada servicio:

**Backend:**
```
DATABASE_URL = (Railway lo asigna automáticamente)
NODE_ENV = production
PORT = 3001
```

**Frontend:**
```
REACT_APP_API_URL = https://tu-backend.up.railway.app
```

---

### PASO 6: DEPLOY

1. Railway automáticamente:
   - Instala dependencias
   - Compila el código
   - Inicia los servicios
   - Te da URLs públicas

2. Espera 5-10 minutos

3. ¡LISTO! Tu CRM está online 🎉

---

## 🌐 ACCESO DESDE INTERNET

Railway te proporciona:
```
https://tu-app-production.up.railway.app
```

Comparte esta URL con tu equipo y ya pueden acceder.

**Usuario demo:**
- Usuario: `admin`
- Contraseña: `admin123`

---

## 📊 CARACTERÍSTICAS LISTAS

### Dashboard
- Métricas en tiempo real
- Total de clientes
- Promedio de calidad
- Promedio de experiencia

### Gestión de Clientes
- ✅ Crear clientes
- ✅ Editar clientes
- ✅ Eliminar clientes
- ✅ Buscar por nombre/empresa/email
- ✅ **IMPORTAR desde Excel/CSV**
- ✅ **EXPORTAR a Excel**

### Registrar Interacciones
- Tipo: Llamada, Email, Visita, Reunión, Soporte
- Puntuación de Calidad (1-10)
- Puntuación de Experiencia (1-10)
- Notas detalladas
- Historial completo

### Gestión de Agentes (Admin)
- Crear agentes
- Asignar clientes
- Eliminar agentes

### Seguridad
- Autenticación JWT
- Contraseñas encriptadas
- Roles: Admin y Agente

---

## 💡 TIPS

### Importar Clientes

1. Ve a "Clientes"
2. Click en **"Importar"**
3. Selecciona archivo Excel con columnas:
   ```
   Nombre | Email | Celular | Empresa
   ```
4. ¡Listo! Se importan automáticamente

### Exportar Clientes

1. Ve a "Clientes"
2. Click en **"Exportar"**
3. Se descarga archivo Excel con todos los datos

### Cambiar Contraseña

1. Haz clic en tu usuario (abajo del sidebar)
2. Click en **"Preferencias"** o **"Cambiar contraseña"**
3. Completa los datos

---

## 🔧 TROUBLESHOOTING

### "Error de conexión a base de datos"
- Espera 2 minutos (la BD se está creando)
- Recarga la página
- Verifica DATABASE_URL en Railway

### "Página en blanco"
- Abre consola (F12)
- Busca errores
- Verifica REACT_APP_API_URL

### "No puedo importar Excel"
- Asegúrate que los encabezados sean: Nombre, Email, Celular, Empresa
- Intenta con Excel puro (.xlsx, no .csv)

### "Los datos no se guardan"
- Verifica que PostgreSQL esté corriendo
- Revisa logs en Railway: Logs → Backend

---

## 📞 CONTACTO & SOPORTE

Si necesitas ayuda:

1. Revisa los logs en Railway
2. Verifica que PostgreSQL esté creada
3. Reinicia los servicios (stop + start)
4. Crea un issue en GitHub

---

## 🎯 PRÓXIMAS MEJORAS

Puedes agregar después:
- Multi-lenguaje (EN, ES, FR)
- Autenticación social (Google, GitHub)
- Exportar reportes a PDF
- Integración con email
- Sincronización con Google Calendar
- Webhooks
- API pública
- App móvil

---

## ✅ CHECKLIST FINAL

- [ ] Archivos preparados (backend, frontend, docker-compose.yml)
- [ ] Registro en Railway
- [ ] Proyecto creado
- [ ] PostgreSQL agregada
- [ ] Backend conectado
- [ ] Frontend conectado
- [ ] Variables de entorno configuradas
- [ ] Deploy completado
- [ ] CRM accesible en la URL
- [ ] Login con admin/admin123
- [ ] Pruebas básicas hechas

---

## 🎉 ¡LISTO!

Tu CRM Conversa está:
- ✅ Online
- ✅ Profesional
- ✅ Seguro
- ✅ Escalable
- ✅ Con importar/exportar
- ✅ Con todas las funciones

**¡A usar!** 🚀
