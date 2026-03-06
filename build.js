const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

// Configuración
const SRC_DIR = './src';
const DIST_DIR = './dist';
const POSTS_DIR = path.join(SRC_DIR, 'posts');
const TEMPLATES_DIR = path.join(SRC_DIR, 'templates');
const STYLES_DIR = path.join(SRC_DIR, 'styles');

// Función para crear URL amigables
function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[áàäâã]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöôõ]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/[ñ]/g, 'n')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// Función para formatear fecha
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Función para generar meta tags SEO
function generateMetaTags(post, isHome = false) {
    if (isHome) {
        return `
    <meta name="description" content="Blog sobre películas y series. Reseñas, noticias y análisis del mundo del cine y la televisión.">
    <meta name="keywords" content="películas, series, cine, televisión, reseñas, noticias, estrenos">
    <meta property="og:title" content="Blog de Películas y Series">
    <meta property="og:description" content="Blog sobre películas y series. Reseñas, noticias y análisis del mundo del cine y la televisión.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="/">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Blog de Películas y Series">
    <meta name="twitter:description" content="Blog sobre películas y series. Reseñas, noticias y análisis del mundo del cine y la televisión.">`;
    }
    
    return `
    <meta name="description" content="${post.summary || post.title}">
    <meta name="keywords" content="${post.category}, ${post.title}, películas, series, reseñas">
    <meta property="og:title" content="${post.title}">
    <meta property="og:description" content="${post.summary || post.title}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="/${post.slug}">
    <meta property="og:image" content="${post.image || '/default-image.jpg'}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${post.title}">
    <meta name="twitter:description" content="${post.summary || post.title}">
    <meta name="twitter:image" content="${post.image || '/default-image.jpg'}">
    <meta name="article:published_time" content="${new Date(post.date).toISOString()}">
    <meta name="article:section" content="${post.category}">`;
}

// Función para leer posts
async function readPosts() {
    const files = await fs.readdir(POSTS_DIR);
    const posts = [];
    
    for (const file of files) {
        if (path.extname(file) === '.md') {
            const filePath = path.join(POSTS_DIR, file);
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const { data, content } = matter(fileContent);
            
            const post = {
                ...data,
                content: marked(content),
                slug: createSlug(data.title),
                filename: file
            };
            
            posts.push(post);
        }
    }
    
    // Ordenar posts por fecha (más recientes primero)
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Función para generar página principal
async function generateHomePage(posts) {
    const template = await fs.readFile(path.join(TEMPLATES_DIR, 'base.html'), 'utf-8');
    
    const postsList = posts.map(post => `
        <article class="post-preview">
            <div class="post-image">
                <img src="${post.image || '/default-image.jpg'}" alt="${post.title}" loading="lazy">
            </div>
            <div class="post-content">
                <div class="post-meta">
                    <span class="category ${post.category.toLowerCase()}">${post.category}</span>
                    <time datetime="${post.date}">${formatDate(post.date)}</time>
                </div>
                <h2><a href="/${post.slug}">${post.title}</a></h2>
                <p class="post-excerpt">${post.summary}</p>
                <a href="/${post.slug}" class="read-more">Leer más →</a>
            </div>
        </article>
    `).join('');
    
    const content = `
        <section class="hero">
            <h1>Blog de Películas y Series</h1>
            <p>Reseñas, noticias y análisis del mundo del cine y la televisión</p>
        </section>
        
        <section class="posts-container">
            <h2>Últimas Publicaciones</h2>
            <div class="posts-grid">
                ${postsList}
            </div>
        </section>
    `;
    
    const html = template
        .replace('{{TITLE}}', 'Blog de Películas y Series')
        .replace('{{META_TAGS}}', generateMetaTags({}, true))
        .replace('{{CONTENT}}', content)
        .replace('{{CURRENT_PAGE}}', 'home');
    
    await fs.writeFile(path.join(DIST_DIR, 'index.html'), html);
}

// Función para generar páginas individuales de posts
async function generatePostPages(posts) {
    const template = await fs.readFile(path.join(TEMPLATES_DIR, 'base.html'), 'utf-8');
    
    for (const post of posts) {
        const content = `
            <article class="post-full">
                <header class="post-header">
                    <div class="post-meta">
                        <span class="category ${post.category.toLowerCase()}">${post.category}</span>
                        <time datetime="${post.date}">${formatDate(post.date)}</time>
                    </div>
                    <h1>${post.title}</h1>
                    ${post.image ? `<img src="${post.image}" alt="${post.title}" class="post-featured-image">` : ''}
                </header>
                <div class="post-body">
                    ${post.content}
                </div>
                <footer class="post-footer">
                    <nav class="post-navigation">
                        <a href="/" class="back-to-home">← Volver al inicio</a>
                    </nav>
                </footer>
            </article>
        `;
        
        const html = template
            .replace('{{TITLE}}', `${post.title} - Blog de Películas y Series`)
            .replace('{{META_TAGS}}', generateMetaTags(post))
            .replace('{{CONTENT}}', content)
            .replace('{{CURRENT_PAGE}}', 'post');
        
        // Crear directorio si no existe
        const postDir = path.join(DIST_DIR, post.slug);
        await fs.ensureDir(postDir);
        await fs.writeFile(path.join(postDir, 'index.html'), html);
    }
}

// Función para generar página de categorías
async function generateCategoryPages(posts) {
    const template = await fs.readFile(path.join(TEMPLATES_DIR, 'base.html'), 'utf-8');
    
    // Obtener categorías únicas
    const categories = [...new Set(posts.map(post => post.category))];
    
    for (const category of categories) {
        const categoryPosts = posts.filter(post => post.category === category);
        const categorySlug = createSlug(category);
        
        const postsList = categoryPosts.map(post => `
            <article class="post-preview">
                <div class="post-image">
                    <img src="${post.image || '/default-image.jpg'}" alt="${post.title}" loading="lazy">
                </div>
                <div class="post-content">
                    <div class="post-meta">
                        <time datetime="${post.date}">${formatDate(post.date)}</time>
                    </div>
                    <h3><a href="/${post.slug}">${post.title}</a></h3>
                    <p class="post-excerpt">${post.summary}</p>
                    <a href="/${post.slug}" class="read-more">Leer más →</a>
                </div>
            </article>
        `).join('');
        
        const content = `
            <section class="category-header">
                <h1>${category}</h1>
                <p>Explora todas nuestras publicaciones sobre ${category.toLowerCase()}</p>
            </section>
            
            <section class="posts-container">
                <div class="posts-grid">
                    ${postsList}
                </div>
            </section>
        `;
        
        const html = template
            .replace('{{TITLE}}', `${category} - Blog de Películas y Series`)
            .replace('{{META_TAGS}}', `
                <meta name="description" content="Explora todas nuestras publicaciones sobre ${category.toLowerCase()}">
                <meta name="keywords" content="${category}, películas, series, reseñas">
            `)
            .replace('{{CONTENT}}', content)
            .replace('{{CURRENT_PAGE}}', 'category');
        
        // Crear directorio si no existe
        const categoryDir = path.join(DIST_DIR, 'categoria', categorySlug);
        await fs.ensureDir(categoryDir);
        await fs.writeFile(path.join(categoryDir, 'index.html'), html);
    }
}

// Función principal de build
async function build() {
    try {
        console.log('🚀 Iniciando build del sitio...');
        
        // Limpiar directorio dist
        await fs.emptyDir(DIST_DIR);
        
        // Copiar estilos
        await fs.copy(STYLES_DIR, path.join(DIST_DIR, 'styles'));
        
        // Leer posts
        const posts = await readPosts();
        console.log(`📝 Procesados ${posts.length} posts`);
        
        // Generar páginas
        await generateHomePage(posts);
        await generatePostPages(posts);
        await generateCategoryPages(posts);
        
        console.log('✅ Build completado exitosamente');
        console.log('📁 Sitio generado en:', DIST_DIR);
        
    } catch (error) {
        console.error('❌ Error durante el build:', error);
        process.exit(1);
    }
}

// Ejecutar build
if (require.main === module) {
    build();
}

module.exports = { build };
