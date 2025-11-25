MVP Todo - Aplicación de Ventas Profesional
Archivos a crear/modificar:
1. Configuración y Layout Principal
src/App.tsx - Configurar rutas principales y contexto global
src/pages/Index.tsx - Dashboard principal con métricas
index.html - Actualizar título y metadatos
2. Páginas Principales
src/pages/Login.tsx - Sistema de autenticación con roles
src/pages/Dashboard.tsx - Panel principal con gráficos y métricas
src/pages/Inventario.tsx - CRUD completo de productos
src/pages/Ventas.tsx - Formulario de registro de ventas
src/pages/Reportes.tsx - Reportes con filtros y exportación
3. Componentes Reutilizables
src/components/Navbar.tsx - Navegación principal con roles
src/components/ProductForm.tsx - Formulario de productos (crear/editar)
src/components/SalesForm.tsx - Formulario dinámico de ventas
src/components/Charts.tsx - Gráficos animados (barras, torta, línea)
4. Contexto y Estado Global
src/context/AppContext.tsx - Estado global de la aplicación
src/types/index.ts - Tipos TypeScript para la aplicación
Funcionalidades MVP:
✅ Autenticación básica con roles (admin/usuario)
✅ CRUD de inventario con validaciones
✅ Registro de ventas con múltiples productos
✅ Métodos de pago ($ y VES) con validaciones
✅ Dashboard con métricas básicas
✅ Reportes con filtros por fecha
✅ Animaciones con Framer Motion
✅ Diseño responsive con colores especificados
Simplificaciones para MVP:
Usar localStorage para persistencia de datos
Exportación básica (sin PDF/Excel real)
Gráficos con datos simulados
Imágenes de productos opcionales (URLs)