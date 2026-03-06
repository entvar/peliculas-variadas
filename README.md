# Blog de Películas y Series 🎬

Un blog estático sobre películas y series optimizado para SEO, construido con Node.js y desplegable en GitHub Pages.

## 🚀 Características

- ✅ **SEO Optimizado**: Meta tags, URLs amigables, structured data
- 📱 **Responsive Design**: Se adapta a todos los dispositivos
- 📝 **Markdown**: Escribe tus posts en formato Markdown
- 🏷️ **Categorías**: Organiza tu contenido por Películas y Series
- ⚡ **Rápido**: Sitio estático, carga instantánea
- 🎨 **Diseño Moderno**: Interfaz limpia y atractiva
- 🔍 **Buscable**: Optimizado para motores de búsqueda

## 📋 Requisitos

- Node.js 14 o superior
- npm o yarn

## 🛠️ Instalación

1. Clona este repositorio:
```bash
git clone <tu-repositorio>
cd blog-peliculas-series
```

2. Instala las dependencias:
```bash
npm install
```

## ✍️ Cómo agregar nuevos posts

1. Crea un nuevo archivo en la carpeta `src/posts/` con extensión `.md`
2. Usa el siguiente formato al principio del archivo (frontmatter):

```markdown
---
title: "Título de tu post"
date: "2024-01-25"
category: "Películas" # o "Series"
summary: "Breve resumen que aparecerá en el listado"
image: "URL de la imagen destacada"
author: "Tu nombre"
---

# Contenido del post

Aquí escribe tu contenido en formato Markdown...
```

3. Ejecuta el comando de build:
```bash
npm run build
```

## 🏗️ Comandos disponibles

```bash
# Construir el sitio
npm run build

# Iniciar servidor de desarrollo
npm run dev

# Limpiar carpeta dist
npm run clean
```

## 📁 Estructura del proyecto

```
├── src/
│   ├── posts/          # Posts en formato Markdown
│   ├── templates/      # Plantillas HTML
│   └── styles/         # Archivos CSS
├── dist/               # Sitio generado (no editar)
├── build.js            # Script de construcción
├── package.json
└── README.md
```

## 🚀 Despliegue en GitHub Pages

### Método 1: Usando GitHub Actions (Recomendado)

1. Sube tu código a un repositorio de GitHub
2. Ve a Settings > Pages
3. Selecciona "GitHub Actions" como fuente
4. Crea el archivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### Método 2: Manual

1. Construye el sitio:
```bash
npm run build
```

2. Sube el contenido de la carpeta `dist/` a la rama `gh-pages` de tu repositorio

## 🎨 Personalización

### Cambiar colores y estilos

Edita el archivo `src/styles/main.css` y modifica las variables CSS al principio:

```css
:root {
    --primary-color: #e50914;    /* Color primario */
    --secondary-color: #221f1f;  /* Color secundario */
    /* ... otras variables */
}
```

### Modificar plantillas

Las plantillas HTML se encuentran en `src/templates/`:
- `base.html`: Plantilla principal
- Puedes agregar más plantillas según necesites

### Agregar nuevas categorías

1. Agrega la nueva categoría en el frontmatter de tus posts
2. Actualiza la navegación en `src/templates/base.html`
3. Agrega los estilos CSS correspondientes en `src/styles/main.css`

## 📊 SEO Features

- **Meta tags**: Descripciones y keywords automáticas
- **Open Graph**: Para compartir en redes sociales
- **Twitter Cards**: Optimizado para Twitter
- **Structured Data**: JSON-LD para mejor indexación
- **URLs amigables**: Generadas automáticamente desde títulos
- **Sitemap**: Generado automáticamente (puedes agregarlo si necesitas)

## 🖼️ Imágenes

Las imágenes se pueden agregar de dos maneras:

1. **URLs externas**: Usa URLs completas en el campo `image` del frontmatter
2. **Imágenes locales**: Coloca las imágenes en una carpeta `src/images/` y referencialas relativamente

## 📱 Responsive Design

El sitio está optimizado para:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🔧 Troubleshooting

### Problemas comunes

1. **Error al construir**: Asegúrate de tener Node.js 14+ y haber ejecutado `npm install`
2. **Posts no aparecen**: Verifica que los archivos .md tengan el frontmatter correcto
3. **Imágenes no cargan**: Verifica las URLs y que sean accesibles

### Logs de depuración

El script de build muestra información detallada:
```bash
npm run build
# 🚀 Iniciando build del sitio...
# 📝 Procesados X posts
# ✅ Build completado exitosamente
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - puedes usar este proyecto para lo que necesites.

## 🙋‍♂️ Soporte

Si tienes problemas o preguntas:
1. Revisa esta documentación
2. Busca issues existentes en GitHub
3. Crea un nuevo issue con detalles del problema

---

**¡Disfruta escribiendo sobre películas y series!** 🍿✨
