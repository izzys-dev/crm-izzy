# 🚀 GUÍA SUPER SIMPLE - 3 PASOS NADA MÁS

## PASO 1: DESCARGA TODO

Ve a `/outputs/` y descarga **TODOS** estos archivos:

```
✅ Dockerfile
✅ docker-compose.yml
✅ .dockerignore
✅ .gitignore
✅ package.json
✅ backend-server.js
✅ backend-package.json
✅ frontend-package-json.txt
✅ App.js (documento HTML)
✅ App.css (archivo CSS)
✅ index.js (archivo JavaScript)
✅ index.html
✅ SETUP.ps1
```

(Total: 13 archivos)

---

## PASO 2: COLOCA TODO EN TU CARPETA CRM

**IMPORTANTE: Descarga TODOS en la MISMA carpeta (C:\Users\Alan\CRM)**

NO los organices aún. Solo descárgalos todos ahí.

---

## PASO 3: EJECUTA EL SCRIPT

1. **Abre PowerShell**
2. **Navega a la carpeta:**
   ```powershell
   cd C:\Users\Alan\CRM
   ```

3. **Ejecuta el script:**
   ```powershell
   .\SETUP.ps1
   ```

4. **El script va a:**
   - ✅ Crear todas las carpetas
   - ✅ Organizar los archivos
   - ✅ Renombrar lo necesario
   - ✅ Hacer git push automático

---

## PASO 4: RENDER

Cuando termine:

1. Ve a **Render.com**
2. Click **"+ New"** → **"Web Service"**
3. Conecta **`izzys-dev/crm-izzy`**
4. Environment: **Docker**
5. Click **"Create Web Service"**
6. **Espera 15 minutos**
7. ¡LISTO! 🎉

---

## ✅ RESULTADO

```
https://crm-izzy.onrender.com

Usuario: admin
Contraseña: admin123
```

---

## 🆘 SI HAY ERROR EN EL SCRIPT

Si PowerShell dice que no puede ejecutar scripts:

1. Abre PowerShell como **ADMINISTRADOR**
2. Ejecuta esto:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Escribe **Y** y presiona ENTER
4. Intenta de nuevo el SETUP.ps1

---

**¿YA DESCARGASTE TODO?** 👇

Dime cuando hayas descargado los 13 archivos en C:\Users\Alan\CRM
