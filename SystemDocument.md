# Documentación del sistema: Webhook WhatsApp MonterosGas

## 1. Visión general

Este proyecto implementa un webhook de WhatsApp que actúa como asistente conversacional para la empresa MonterosGas. Permite:

- Atender usuarios nuevos y recurrentes.
- Gestionar ventas de recargas, envases y accesorios.
- Recibir soporte.
- Registrar pedidos en un backend externo.
- Manejar facturación electrónica básica.

## 2. Arquitectura general

### 2.1. Servidor

- `src/server.js`
  - Inicializa el servidor Express.
  - Usa el puerto definido en `src/config/env.js`.

- `src/app.js`
  - Configura Express.
  - Activa `express.json()` para parsear JSON.
  - Monta la ruta `/webhook` con `src/routes/webhook.routes.js`.

### 2.2. Rutas

- `src/routes/webhook.routes.js`
  - `GET /webhook` → `verifyWebhook`
  - `POST /webhook` → `webhookHandler`

### 2.3. Configuración

- `src/config/env.js`
  - Carga variables de entorno con `dotenv`.
  - Define:
    - `PORT`
    - `VERIFY_TOKEN`
    - `WHATSAPP_TOKEN`
    - `PHONE_NUMBER_ID`

## 3. Controlador principal

- `src/controllers/webhook.controller.js`

Funciones principales:

- `verifyWebhook(req, res)`
  - Valida el challenge de configuración del webhook de WhatsApp.
  - Compara `hub.verify_token` con `VERIFY_TOKEN`.

- `webhookHandler(req, res)`
  - Extrae los datos relevantes del payload WhatsApp mediante `extractWhatsAppData`.
  - Llama a `handleFlow` con el usuario y el input.
  - No realiza gestión de persistencia de cliente local; todo el manejo lo delega al flujo.

## 4. Extracción de datos de WhatsApp

- `src/utils/extractor.js`

Hace:

- `body.entry[0].changes[0].value`
- Detecta:
  - `from` → número remitente
  - `messageId`
  - `input` → texto, botón o lista
  - `name` → nombre del contacto
  - `phoneNumberId`

Retorna `null` si no hay mensaje válido.

## 5. Gestión de estado por usuario

- `src/utils/stateManager.js`

Estado en memoria:

- `getState(user)` → devuelve el estado actual o `{ step: "WELCOME" }`
- `setState(user, data)` → almacena estado
- `resetState(user)` → vuelve a `{ step: "WELCOME" }`

> El estado es volátil y se pierde al reiniciar el proceso.

## 6. Servicio WhatsApp

- `src/services/whatsapp.service.js`

Funciones:

- `sendButtons(to, body, buttons)`
  - Envía mensaje interactivo con botones.
- `sendList(to, body, buttonText, sections)`
  - Envía mensaje interactivo con lista de opciones.
- `sendText(to, text)`
  - Envía mensaje de texto simple.

Usa la API de WhatsApp Graph:

- URL base: `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`
- Autenticación: `Bearer ${WHATSAPP_TOKEN}`

## 7. Integración con backend externo

- `src/services/backendApi.js`

Axios configurado con:

- `BACKEND_URL`
- `BACKEND_API_KEY`

Endpoints consumidos:

- `/api/products/list-products-whatsapp`
- `/api/workorders/create-workorder-whatsapp`
- `/api/places/placeID-whatsapp/{place}`
- `/api/customers/by-phone/{phone}`
- `/api/customers/create-customer`
- `/api/customers/update-customer/{id}`

Funciones expuestas:

- `getProductsAPI()`
- `createWorkOrderAPI(orderPayload)`
- `getPlaceIDAPI(place)`
- `getCustomerByPhone(phone)`
- `createCustomerAPI(customerData)`
- `updateCustomer(phone, payload)`

## 8. Servicio de usuario y producto

- `src/services/user.service.js`

Funcionalidad:

- `getUserByPhone(phone)`
- `createCustomer(customerData)`
- `updateUser(phone, payload)`
- `getProducts()`
- `getProductPrice(productName)`
- `getProductID(productName)`
- `getIDPlace(place)`
- `createWorkorder(payload)`

Validaciones:

- `getProductPrice()` y `getProductID()` obtienen datos desde el catálogo de productos.
- Si no existe el producto o no tiene precio/ID, lanza error.

## 9. Flujo conversacional

- `src/services/flow.service.js`

### 9.1. Objetivo

Controlar la conversación paso a paso para:

- Registrar usuario nuevo.
- Identificar usuario existente.
- Vender recargas/envases/accesorios.
- Recibir dirección y factura.
- Confirmar orden.
- Enviar pedido al backend.

### 9.2. Estados del flujo

- `WELCOME`
- `REGISTER_NAME`
- `REGISTER_CONFIRM_NAME`
- `MENU`
- `PRODUCT_TYPE`
- `SIZE`
- `QUANTITY`
- `PAYMENT`
- `ADDRESS_CONFIRM`
- `CITY_DETAIL`
- `CITY_ADDRESS`
- `ADDRESS`
- `INVOICE`
- `INVOICE_USER`
- `INVOICE_EMAIL`
- `INVOICE_ACTIVIDAD`
- `INVOICE_CEDULA`
- `CONFIRM`
- `SUPPORT`

### 9.3. Comportamiento principal

#### Inicialización

- Si el estado no está inicializado:
  - Consulta el cliente por teléfono.
  - Si existe:
    - Carga datos de nombre, email y dirección.
    - Envía menú principal.
  - Si no existe:
    - Solicita nombre del usuario.

#### Registro de usuario nuevo

- Pregunta nombre.
- Confirma nombre.
- Avanza al menú principal.

#### Menú principal

- Opciones:
  - `VENTAS`
  - `ACCESORIOS`
  - `SERVICIO_CLIENTE`

#### Flujo de venta

- `VENTAS` → `PRODUCT_TYPE`
  - Elige entre `RECHARGE` y `CONTAINER`
- `SIZE`
  - Selecciona tamaño/variante
- `QUANTITY`
  - Define cantidad
- `PAYMENT`
  - Elige método de pago: `SINPE`, `EFECTIVO`, `TRANSFERENCIA`

#### Dirección

- Cliente existente:
  - `ADDRESS_CONFIRM` pregunta si usa la dirección guardada
- Cliente nuevo o dirección incorrecta:
  - `CITY_DETAIL` elige cantón
  - `CITY_ADDRESS` elige población
  - `ADDRESS` ingresa dirección exacta

#### Factura electrónica

- `INVOICE` pregunta si desea factura
- Si no:
  - va directo a resumen de pedido
- Si sí:
  - Cliente existente:
    - muestra datos fiscales guardados
    - permite confirmar o corregir
  - Cliente nuevo:
    - solicita `INVOICE_EMAIL`
    - solicita `INVOICE_ACTIVIDAD`
    - solicita `INVOICE_CEDULA`

#### Confirmación y creación de orden

- `buildSummaryAndConfirm()`
  - Calcula precio final consultando `getProductPrice(productName)`
  - Muestra resumen de pedido
  - Pide confirmación
- `CONFIRM`
  - Si confirma:
    - Si es nuevo cliente, crea el cliente en backend
    - Obtiene datos del cliente
    - Obtiene IDs de producto y lugar
    - Crea la orden con `createWorkorder`
  - Si cancela:
    - Reinicia el flujo

#### Soporte

- `SUPPORT`
  - Envía mensaje de espera de agente
  - Reinicia el estado

## 10. Cálculo de producto y total

- El nombre de producto se construye a partir de:
  - `type` (`CONTAINER`, `RECHARGE`, `ACCESORIO`)
  - `size` o `product`
- Ejemplo:
  - `Envase 10L`
  - `Recarga Liquido Gas LP 20L`
- El precio se obtiene de `getProductPrice(productName)`
- Total = `precioProducto * cantidad`

## 11. Observaciones clave

- El flujo se apoya en estados guardados en memoria por usuario.
- El backend externo es la fuente de verdad para:
  - clientes
  - productos
  - lugares
  - órdenes
- La validación de email y cédula es básica.
- El sistema utiliza mensajes interactivos de WhatsApp con botones y listas.
- No hay persistencia de usuario local entre reinicios del servidor.

## 12. Componentes principales

- `src/server.js`
- `src/app.js`
- `src/routes/webhook.routes.js`
- `src/controllers/webhook.controller.js`
- `src/services/flow.service.js`
- `src/services/whatsapp.service.js`
- `src/services/user.service.js`
- `src/services/backendApi.js`
- `src/utils/extractor.js`
- `src/utils/stateManager.js`
- `src/config/env.js`

---
