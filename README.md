# 🎂 Pastelería Lama - Proyecto Transversal DAW

> **Desarrollo de Aplicación Web para la gestión integral de una pastelería artesanal.**
> 
>  *Proyecto Transversal de 2º curso de Desarrollo de Aplicaciones Web (DAW) - EFA Moratalaz.*

![Estado del proyecto](https://img.shields.io/badge/Estado-Frontend%20Completado-success)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.2-purple)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## 📖 Descripción del Proyecto

Este proyecto consiste en el desarrollo del **Front-end** para la modernización de la web de **Pastelería Lama**, un negocio familiar que busca digitalizar sus procesos y expandir su clientela.

La aplicación permite la interacción de tres roles diferenciados (Cliente, Empleado y Administrador), cubriendo desde el catálogo público de productos hasta la gestión interna de inventario y personal.

## 🎯 Objetivos Académicos

Este proyecto integra conocimientos de los siguientes módulos del ciclo:
* Diseño de Interfaces Web (DIW).
* Desarrollo Web en Entorno Cliente (DWEC).
* Despliegue de Aplicaciones Web.

## ✨ Funcionalidades Implementadas

### 🌍 Parte Pública (Web Corporativa)
* **Diseño Responsivo:** Adaptado a móviles, tablets y escritorio utilizando **Bootstrap 5**.
* **Catálogo Interactivo:** Categorías con efecto *flip-card* para ver ingredientes y alérgenos.
* **Contacto:** Formulario con validación en tiempo real y mapa integrado.

### 👤 Área Privada: Cliente
* **Registro y Login:** Interfaz de acceso unificada.
* **Perfil de Usuario:** Gestión de datos personales y preferencias.
* **Dashboard:** Acceso rápido a productos y contacto.

### 👨‍🍳 Área Privada: Empleado
* **Gestión de Inventario:** Listados para consultar y gestionar productos e ingredientes.
* **Gestión de Pedidos:** Visualización de pedidos y cambio de estado ("Pendiente" a "Entregado").
* **Control Horario:** Interfaz de fichaje para registrar hora de entrada y salida.

### 🛡️ Área Privada: Administrador
* **Dashboard Estadístico:** Visualización de beneficios.
* **Gestión de RRHH:** Alta de nuevos empleados y supervisión de fichajes.

## 📂 Estructura del Proyecto

```
/
├── .github/                 # Configuraciones de GitHub
├── assests/                 # Imágenes, logotipos y favicons
├── pages/                   # Páginas HTML del sitio
│   ├── admin/               # Módulo de Administración
│   │   ├── css/             # Estilos específicos de admin
│   │   ├── js/              # Lógica de dashboard admin
│   │   └── admin_dashboard.html
│   ├── cliente/             # Módulo de Cliente
│   │   ├── css/
│   │   ├── js/
│   │   └── client_dashboard.html
│   ├── products/            # Vistas de categorías del catálogo
│   │   ├── cakes_category.html
│   │   ├── pastry_category.html
│   │   ├── salad_category.html
│   │   └── specialities_category.html
│   ├── trabajador/          # Módulo de Empleado
│   │   ├── css/             # Estilos específicos de empleado
│   │   ├── js/              # Lógica de inventario, pedidos y fichaje
│   │   ├── employee_inventory.html
│   │   ├── employee_orders.html
│   │   └── time_clock.html
│   ├── aviso-legal.html
│   ├── contact.html
│   ├── cookies.html
│   ├── login.html           # Pasarela de acceso principal
│   ├── orders.html          # Formulario de encargos público
│   ├── panel-admin.html     # Landing del área Admin
│   ├── panel-cliente.html   # Landing del área Cliente
│   ├── panel-trabajador.html# Landing del área Trabajador
│   ├── privacidad.html
│   └── products.html        # Índice del catálogo
├── auth-core.js             # Núcleo de lógica de autenticación y roles
├── auth-login.js            # Lógica específica del formulario de login
├── index.html               # Página de inicio (Landing Page)
├── panel.js                 # Lógica común para los paneles de usuario
├── script.js                # Scripts globales (Navbar, validaciones públicas)
├── style.css                # Hoja de estilos principal
└── README.md                # Documentación del proyecto
```
🛠️ Tecnologías Utilizadas
* HTML5 Semántico: Estructura limpia y accesible.
* CSS3:
  - Variables CSS para paleta corporativa.
  - Flexbox para layout y Sticky Footer.
  - Media Queries para diseño Mobile First.
* Framework: Bootstrap 5.3.2.
* JavaScript (Vanilla):
  - Expresiones Regulares (RegEx) para validación de formularios.
  - Lógica de simulación de roles y protección de rutas en el frontend.
  - Iconografía: FontAwesome 6.0.

🚀 Instalación y Uso
Clonar el repositorio:
  git clone https://github.com/kelsioner/Pasteleria-Lama--Paula_Gaspar-.git

Ejecutar:
No requiere instalación de dependencias. Abre el archivo index.html en tu navegador o usa una extensión como Live Server para una mejor experiencia.

🔑 Credenciales de Acceso (Simulación)
> El sistema de login (login.html) redirige a los diferentes paneles basándose en palabras clave en el nombre de usuario (simulación de backend):
  - Administrador: Usuario que contenga admin -> Redirige a panel-admin.html.
  - Trabajador: Usuario que contenga empleado o trabajador -> Redirige a panel-trabajador.html.
  - Cliente: Cualquier otro nombre de usuario -> Redirige a panel-cliente.html.

Alumno: [Gaspar Arroyo] y [Paula Nuñez]
