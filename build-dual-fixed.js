const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

// Configuración
const SRC_DIR = './src';
const POSTS_DIR = path.join(SRC_DIR, 'posts');
const TEMPLATES_DIR = path.join(SRC_DIR, 'templates');
const STYLES_DIR = path.join(SRC_DIR, 'styles');

// Configuración para los dos sitios
const SITES = {
    peliculas: {
        name: 'Películas Variadas',
        distDir: './dist/peliculas-variadas',
        templateDir: path.join(TEMPLATES_DIR, 'peliculas'),
        category: 'Películas',
        baseUrl: '/peliculas-variadas'
    },
    series: {
        name: 'Series Variadas',
        distDir: './dist/series-variadas',
        templateDir: path.join(TEMPLATES_DIR, 'series'),
        category: 'Series',
        baseUrl: '/series-variadas'
    }
};

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
function generateMetaTags(post, siteConfig, isHome = false) {
    const baseUrl = siteConfig.baseUrl;
    
    if (isHome) {
        return `
    <meta name="description" content="${siteConfig.name}">
    <meta name="keywords" content="${siteConfig.category.toLowerCase()}">
    <meta property="og:title" content="${siteConfig.name}">
    <meta property="og:description" content="${siteConfig.name}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${baseUrl}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${siteConfig.name}">
    <meta name="twitter:description" content="${siteConfig.name}">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:;">`;
    }
    
    // Sanitize post data
    const sanitizedTitle = (post.title || '').replace(/[<>'"&]/g, '').substring(0, 100);
    const sanitizedSummary = (post.summary || '').replace(/[<>'"&]/g, '').substring(0, 200);
    
    return `
    <meta name="description" content="${sanitizedSummary}">
    <meta name="keywords" content="${post.category}, ${sanitizedTitle}, ${siteConfig.category.toLowerCase()}, reseñas">
    <meta property="og:title" content="${sanitizedTitle}">
    <meta property="og:description" content="${sanitizedSummary}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${baseUrl}/${post.slug}">
    <meta property="og:image" content="${post.image || '/default-image.jpg'}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${sanitizedTitle}">
    <meta name="twitter:description" content="${sanitizedSummary}">
    <meta name="twitter:image" content="${post.image || '/default-image.jpg'}">
    <meta name="article:published_time" content="${new Date(post.date).toISOString()}">
    <meta name="article:section" content="${post.category}">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:;">`;
}

// Función para leer posts por categoría
async function readPostsByCategory(category) {
    const files = await fs.readdir(POSTS_DIR);
    const posts = [];
    
    for (const file of files) {
        if (path.extname(file) === '.md') {
            const filePath = path.join(POSTS_DIR, file);
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const { data, content } = matter(fileContent);
            
            // Solo incluir posts de la categoría especificada
            if (data.category === category) {
                const post = {
                    ...data,
                    content: marked(content),
                    slug: createSlug(data.title),
                    filename: file
                };
                
                posts.push(post);
            }
        }
    }
    
    // Ordenar posts por fecha (más recientes primero)
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Función para generar página principal
async function generateHomePage(posts, siteConfig) {
    const templatePath = path.join(siteConfig.templateDir, 'base.html');
    const template = await fs.readFile(templatePath, 'utf-8');
    
    const postsList = posts.map(post => `
        <article class="post-preview">
            <div class="post-image">
                <img src="${post.image || '/default-image.jpg'}" alt="${post.title}" loading="lazy">
            </div>
            <div class="post-content">
                <div class="post-meta">
                </div>
                <h2><a href="${siteConfig.baseUrl}/${post.slug}">${post.title}</a></h2>
                <p class="post-excerpt">${post.summary}</p>
                <a href="${siteConfig.baseUrl}/${post.slug}" class="read-more">Ver →</a>
            </div>
        </article>
    `).join('');
    
    const content = `
        <section class="posts-container">
            <div class="posts-grid">
                ${postsList}
            </div>
        </section>
    `;
    
    const html = template
        .replace(/\{\{TITLE\}\}/g, siteConfig.name)
        .replace(/\{\{META_TAGS\}\}/g, generateMetaTags({}, siteConfig, true))
        .replace(/\{\{CONTENT\}\}/g, content)
        .replace(/\{\{CURRENT_PAGE\}\}/g, 'home')
        .replace(/\{\{SITE_NAME\}\}/g, siteConfig.name)
        .replace(/\{\{BASE_URL\}\}/g, siteConfig.baseUrl)
        .replace(/\{\{CURRENT_PAGE === 'home'\s*\?\s*'\/'\s*:\s*'\/'\s*\+\s*CURRENT_PAGE\}\}/g, '/')
        .replace(/\{\{CURRENT_PAGE === 'category'\s*&&\s*CATEGORY === 'peliculas'\s*\?\s*'active'\s*:\s*''\}\}/g, '')
        .replace(/\{\{CURRENT_PAGE === 'category'\s*&&\s*CATEGORY === 'series'\s*\?\s*'active'\s*:\s*''\}\}/g, '');
    
    await fs.writeFile(path.join(siteConfig.distDir, 'index.html'), html);
}

// Función para generar páginas individuales de posts
async function generatePostPages(posts, siteConfig) {
    const templatePath = path.join(siteConfig.templateDir, 'base.html');
    const template = await fs.readFile(templatePath, 'utf-8');
    
    for (const post of posts) {
        const content = `
            <article class="post-full">
                <header class="post-header">
                    <div class="post-meta">
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
                        <a href="${siteConfig.baseUrl}/" class="back-to-home">← Volver al inicio</a>
                    </nav>
                </footer>
            </article>
        `;
        
        const html = template
            .replace(/\{\{TITLE\}\}/g, `${post.title} - ${siteConfig.name}`)
            .replace(/\{\{META_TAGS\}\}/g, generateMetaTags(post, siteConfig))
            .replace(/\{\{CONTENT\}\}/g, content)
            .replace(/\{\{CURRENT_PAGE\}\}/g, 'post')
            .replace(/\{\{SITE_NAME\}\}/g, siteConfig.name)
            .replace(/\{\{BASE_URL\}\}/g, siteConfig.baseUrl)
            .replace(/\{\{CURRENT_PAGE === 'home'\s*\?\s*'\/'\s*:\s*'\/'\s*\+\s*CURRENT_PAGE\}\}/g, `/${post.slug}`)
            .replace(/\{\{CURRENT_PAGE === 'category'\s*&&\s*CATEGORY === 'peliculas'\s*\?\s*'active'\s*:\s*''\}\}/g, '')
            .replace(/\{\{CURRENT_PAGE === 'category'\s*&&\s*CATEGORY === 'series'\s*\?\s*'active'\s*:\s*''\}\}/g, '');
        
        // Crear directorio si no existe
        const postDir = path.join(siteConfig.distDir, post.slug);
        await fs.ensureDir(postDir);
        await fs.writeFile(path.join(postDir, 'index.html'), html);
    }
}

// Función principal de build para un sitio
async function buildSite(siteKey, siteConfig) {
    try {
        console.log(`🚀 Iniciando build de ${siteConfig.name}...`);
        
        // Limpiar directorio dist
        await fs.emptyDir(siteConfig.distDir);
        
        // Copiar estilos
        await fs.copy(STYLES_DIR, path.join(siteConfig.distDir, 'styles'));
        
        // Leer posts de la categoría específica
        const posts = await readPostsByCategory(siteConfig.category);
        console.log(`📝 Procesados ${posts.length} posts de ${siteConfig.category}`);
        
        // Generar páginas
        await generateHomePage(posts, siteConfig);
        await generatePostPages(posts, siteConfig);
        
        console.log(`✅ Build de ${siteConfig.name} completado exitosamente`);
        console.log(`📁 Sitio generado en: ${siteConfig.distDir}`);
        
    } catch (error) {
        console.error(`❌ Error durante el build de ${siteConfig.name}:`, error);
        throw error;
    }
}

// Función principal de build dual
async function build() {
    try {
        console.log('🎬 Iniciando build dual de sitios...');
        
        // Construir ambos sitios
        await buildSite('peliculas', SITES.peliculas);
        await buildSite('series', SITES.series);
        
        console.log('🎉 Build dual completado exitosamente');
        console.log('📁 Sitios generados:');
        console.log(`   - Películas: ${SITES.peliculas.distDir}`);
        console.log(`   - Series: ${SITES.series.distDir}`);
        
    } catch (error) {
        console.error('❌ Error durante el build dual:', error);
        process.exit(1);
    }
}

// Ejecutar build
if (require.main === module) {
    build();
}

module.exports = { build };
