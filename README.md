# Webhook WhatsApp MonterosGas

---

## 📌 Descripción

Proyecto que implementa un webhook de WhatsApp para manejar un asistente conversacional de ventas, recargas, accesorios y soporte. Utiliza la API de WhatsApp Graph para enviar mensajes interactivos y un backend externo para consultar clientes, productos y crear órdenes.

---

## 🔧 Instalación

1. Clona el repositorio.
2. Instala dependencias:
   ```bash
   npm install
   ```

---

## 🔧 Requerimientos

- Node.js >= 20.0.0
- MariaDB (or another Sequelize-supported database - see `DB_DIALECT`)
- npm or yarn

---

## Uso

- Iniciar el servidor:
  npm start
- Modo desarrollo:
  npm run dev

---

## 🚀 Quick Start

### Servidor

```bash
npm start
npm run dev
```

### Desarrollo

```bash
npm install
npm run dev
```

---

## 🧾 Scripts

### Backend (`backend/package.json`)

- `npm run dev` — Start with nodemon (development)
- `npm start` — Start production server
- `npm test` — Run tests (Jest)
- `npm run db:reset:all` — Reset database schema/seed (⚠️ local only!)
- `npm run seed:rbac` — Seed initial roles and permissions

### Frontend (`frontend/package.json`)

- `npm run dev` — Start Vite dev server
- `npm run build` — Build for production
- `npm test` — Run tests (Vitest)
- `npm run preview` — Preview production build

---

## Punto de entrada

- src/server.js inicia el servidor Express.
- src/app.js configura la app y la ruta /webhook.

---

## Rutas principales

- GET /webhook — verifica el webhook de WhatsApp.
- POST /webhook — recibe mensajes entrantes de WhatsApp y ejecuta el flujo conversacional.

---

## Variables de entorno necesarias

- PORT
- VERIFY_TOKEN
- WHATSAPP_TOKEN
- PHONE_NUMBER_ID
- BACKEND_URL
- BACKEND_API_KEY

---

## Estructura básica

- src/controllers/webhook.controller.js — recibe y valida el webhook, extrae datos y ejecuta el flujo.
- src/services/flow.service.js — controla la lógica de conversación y los estados.
- src/services/whatsapp.service.js — envía mensajes a WhatsApp.
- src/services/user.service.js — consulta y actualiza datos de clientes/productos/órdenes.
- src/services/backendApi.js — comunica con el backend externo.
- src/utils/extractor.js — extrae datos del payload de WhatsApp.
- src/utils/stateManager.js — mantiene el estado temporal por usuario en memoria.

---

## Nota

El estado de cada usuario se guarda en memoria y se pierde al reiniciar el servidor.

---

## Desarrollo por XOTRIK

[XOTRIK.com](https://www.xotrik.com/)
