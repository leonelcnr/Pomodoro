<div align="center">  
  <img src="/public/doro.svg" alt="Doro Logo" width="120" />
  <h1>Doro</h1>
  <p>Tu compañero ideal para estudiar de forma sincronizada y aumentar tu productividad.</p>
</div>

---

## 🚀 Sobre Doro

**Doro** es una aplicación de temporizador Pomodoro avanzada diseñada para estudiar, trabajar o concentrarse tanto de manera individual como con amigos. Doro permite sincronizar salas de estudio con un chat, música y tareas compartidas usando actualizaciones en tiempo real.

## ✨ Funcionalidades Principales

- **⏱️ Temporizador Pomodoro**:
  Personaliza tus tiempos de estudio, descansos cortos y descansos largos.
- **🤝 Salas de Estudio Sincronizadas**:
  Crea o únete a salas en tiempo real. Estudia de forma concurrente con amigos o colegas. El estado del temporizador se comparte para todos los participantes.
- **🎵 Reproductor de Música Integrado**:
  - **Música de la Sala (YouTube)**: Escucha de manera sincronizada videos con todos los integrantes de tu sala.
  - **Música Individual (Spotify)**: También puedes usar enlaces de Spotify locales si prefieres concentrarte con tu propia música.
- **📝 Tareas de la Sala (Drag & Drop)**:
  Una lista de tareas compartida mediante arrastrar y soltar (Drag & Drop) totalmente sincronizada en tiempo real. Todos ven el progreso de forma instantánea.
- **🔥 Rachas (Streaks) y Estadísticas**:
  Lleva el control de tus rachas de estudio diarias. Completa al menos una sesión para mantener viva tu llama y revisar tus estadísticas de productividad.
- **🔐 Autenticación Rápida**:
  Inicia sesión de forma segura y sencilla utilizando tus cuentas favoritas (Google, GitHub, Discord) mediante OAuth.
- **🎨 Modo Oscuro/Claro**:
  Interfaz de usuario moderna y adaptable a tus preferencias visuales.

## 🛠️ Tecnologías y Herramientas

El proyecto está construido usando las tecnologías más modernas del ecosistema web:

- **Frontend**: [React 19](https://react.dev/) y [TypeScript](https://www.typescriptlang.org/) impulsado por [Vite](https://vitejs.dev/)
- **Estilos y UI**:
  - [Tailwind CSS v4](https://tailwindcss.com/)
  - [Shadcn UI](https://ui.shadcn.com/) y [Hero UI](https://nextui.org/)
  - [Radix UI](https://www.radix-ui.com/) para accesibilidad
- **Animaciones y Drag & Drop**:
  - [Framer Motion](https://www.framer.com/motion/)
  - [dnd-kit](https://dndkit.com/)
- **Backend / BaaS**: [Supabase](https://supabase.com/) (Base de datos PostgreSQL, Auth OAuth y Suscripciones Realtime)
- **Estado Global**: [Zustand](https://github.com/pmndrs/zustand)
- **Analíticas**: [Vercel Analytics](https://vercel.com/analytics)
- **Gráficos y Datos**: [Recharts](https://recharts.org/)

## 📸 Capturas de Pantalla

- **Home**:
  ![Home](./public/Home.png)
- **Login**:
  ![Login](./public/login.png)
- **Sala de Estudio**:
  ![Room](./public/RoomPage.png)
- **Sala de Estadisticas**:
  ![Room](./public/dashboard.png)

## 🚀 Instalación y Desarrollo Local

1. **Clonar el repositorio**:

   ```bash
   git clone https://github.com/leonelcnr/Pomodoro.git
   ```

2. **Instalar dependencias**:

   ```bash
   npm install
   ```

3. **Variables de Entorno**:
   Crea un archivo `.env.local` en la raíz copiando el ejemplo. Debes configurar tus claves de Supabase:

   ```env
   VITE_SUPABASE_URL=tu_url_de_proyecto
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   ```

4. **Correr el servidor de desarrollo**:

   ```bash
   npm run dev
   ```

5. **Construir para Producción**:
   ```bash
   npm run build
   ```


