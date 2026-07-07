# Dulce Margarita — E-Commerce de Budines Caseros

Tienda online para **Dulce Margarita**, una pastelería artesanal enfocada en budines caseros.
Construida con React 19 + TypeScript + Vite 8, con Firebase como backend y deploy en **Cloudflare Pages**.

---

## Stack Tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| React | 19 | UI Framework |
| TypeScript | 6 | Tipado estático |
| Vite | 8 | Build tool / Dev server |
| Firebase Auth | 12 | Autenticación |
| Firestore | 12 | Base de datos |
| React Router | 7 | Navegación SPA |
| Lucide React | latest | Iconos |
| Cloudflare Pages | — | Hosting & CDN |

---

## Setup Local

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd pasteleria-e-commerce
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales de Firebase
```

### 3. Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

> **Nota:** Si no configurás las variables de Firebase, la app funciona igual usando localStorage como base de datos de demo.

---

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Dev server con HMR |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build local |
| `npm run lint` | ESLint |

---

## Estructura del Proyecto

```
src/
├── components/
│   └── Navbar.tsx          # Navegación principal
├── pages/
│   ├── Home.tsx            # Landing page
│   ├── Shop.tsx            # Catálogo de productos
│   ├── ProductDetail.tsx   # Detalle de producto
│   ├── Cart.tsx            # Carrito de compras
│   ├── Checkout.tsx        # Proceso de pago
│   ├── Auth.tsx            # Login / Registro
│   ├── Admin.tsx           # Panel de administración
│   └── Orders.tsx          # Historial de pedidos
├── context/
│   └── AppContext.tsx      # Estado global (carrito, usuario, tema)
├── services/
│   ├── authService.ts      # Firebase Auth
│   └── dbService.ts        # Firestore / localStorage fallback
├── firebase.ts             # Configuración Firebase
├── App.tsx                 # Rutas + layout
└── index.css               # Design system (variables CSS, componentes)
```

---

## Deploy en Cloudflare Pages

### Configuración del proyecto en Cloudflare

1. Ir a [Cloudflare Pages](https://pages.cloudflare.com/) → **Create a project**
2. Conectar el repositorio de GitHub
3. Configurar el build:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. En **Settings → Environment Variables**, agregar todas las variables de `VITE_FIREBASE_*`

### Deploy manual (opcional)

```bash
npm run build
npx wrangler pages deploy dist --project-name pasteleria-e-commerce
```

---

## Firebase Setup

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar **Authentication** → Email/Password
3. Habilitar **Firestore Database** en modo producción
4. Configurar reglas de Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /orders/{id} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Funcionalidades

- ✅ Catálogo de productos (budines)
- ✅ Detalle de producto con selección de tamaño y personalizaciones
- ✅ Carrito persistente en localStorage
- ✅ Checkout con formulario de envío
- ✅ Autenticación con Firebase (login / registro)
- ✅ Historial de pedidos por usuario
- ✅ Panel de administración (CRUD de productos, gestión de órdenes)
- ✅ Tema claro / oscuro
- ✅ Fallback a localStorage si Firebase no está configurado

---

## Licencia

© 2026 Dulce Margarita. Todos los derechos reservados.
