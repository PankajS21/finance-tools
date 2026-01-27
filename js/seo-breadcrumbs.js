// Breadcrumb Navigation Generator - Fixed
function generateBreadcrumbs() {
    try {
        const path = window.location.pathname;
        const breadcrumbs = [];
        const urlParams = new URLSearchParams(window.location.search);
        
        // Home always first
        breadcrumbs.push({
            name: 'Home',
            url: '/'
        });
        
        // Parse path segments
        const segments = path.split('/').filter(segment => segment && segment !== 'index.html');
        
        let currentUrl = '';
        segments.forEach((segment, index) => {
            currentUrl += '/' + segment;
            
            // Clean up segment name
            let name = segment
                .replace('.html', '')
                .replace('.php', '')
                .replace(/-/g, ' ')
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            
            // Special cases
            if (name === 'Blog') name = 'Financial Blog';
            if (name === 'About') name = 'About Us';
            if (name === 'Contact') name = 'Contact Us';
            if (name === 'Sitemap') name = 'Site Map';
            if (name === 'Privacy Policy') name = 'Privacy Policy';
            if (name === 'Terms') name = 'Terms of Service';
            
            breadcrumbs.push({
                name: name,
                url: currentUrl
            });
        });
        
        // Handle query parameters for blog categories
        const category = urlParams.get('category');
        if (category) {
            const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
            breadcrumbs.push({
                name: categoryName + ' Articles',
                url: window.location.pathname + '?category=' + category
            });
        }
        
        // Generate schema
        const schema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": item.name,
                "item": "https://financetools.com" + (item.url || '/')
            }))
        };
        
        // Remove existing breadcrumb schema
        const existingBreadcrumb = document.querySelector('script[data-breadcrumb]');
        if (existingBreadcrumb) {
            existingBreadcrumb.remove();
        }
        
        // Inject into page
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-breadcrumb', 'dynamic');
        script.textContent = JSON.stringify(schema, null, 2);
        document.head.appendChild(script);
        
        // Also create visible breadcrumbs if needed
        createVisibleBreadcrumbs(breadcrumbs);
        
    } catch (error) {
        console.error('Error generating breadcrumbs:', error);
    }
}

// Create visible breadcrumbs in the page - Fixed
// function createVisibleBreadcrumbs(breadcrumbs) {
//     const breadcrumbContainer = document.querySelector('.breadcrumb .container') || 
//                                document.querySelector('[data-breadcrumb-container]');
    
//     if (breadcrumbContainer && breadcrumbs.length > 1) {
//         let html = '';
        
//         breadcrumbs.forEach((crumb, index) => {
//             if (index === breadcrumbs.length - 1) {
//                 // Last item (current page)
//                 html += '<span class="current">' + crumb.name + '</span>';
//             } else {
//                 // Link items
//                 const separator = index > 0 ? '<i class="fas fa-chevron-right"></i>' : '';
//                 html += separator + '<a href="' + crumb.url + '">' + crumb.name + '</a>';
//             }
//         });
        
//         breadcrumbContainer.innerHTML = html;
//     }
// }

// Generate breadcrumbs for all pages
document.addEventListener('DOMContentLoaded', generateBreadcrumbs);

// Update breadcrumbs when URL changes (for SPA-like behavior)
if (window.history && window.history.pushState) {
    const originalPushState = history.pushState;
    history.pushState = function() {
        originalPushState.apply(this, arguments);
        setTimeout(generateBreadcrumbs, 100);
    };
    
    window.addEventListener('popstate', function() {
        setTimeout(generateBreadcrumbs, 100);
    });
}
