// Dynamically update structured data - Fixed
function updateSchemaData() {
    try {
        // Find existing schema scripts
        const schemaScripts = document.querySelectorAll('script[type="application/ld+json"]');
        
        schemaScripts.forEach(script => {
            try {
                const data = JSON.parse(script.textContent);
                const now = new Date().toISOString();
                
                // Update common properties
                if (data.dateModified) {
                    data.dateModified = now;
                }
                
                if (data.datePublished && !data.datePublished.includes('T')) {
                    // Format date properly if not already formatted
                    data.datePublished = data.datePublished + 'T00:00:00+05:30';
                }
                
                // Update URL to current page
                if (data.url && data.url.includes('[PAGE-URL]')) {
                    data.url = window.location.href;
                }
                
                // Update WebPage schema
                if (data['@type'] === 'WebPage') {
                    data.url = window.location.href;
                    data.dateModified = now;
                }
                
                // Update BreadcrumbList
                if (data['@type'] === 'BreadcrumbList' && data.itemListElement) {
                    // Ensure breadcrumbs point to current domain
                    data.itemListElement.forEach(item => {
                        if (item.item && typeof item.item === 'string') {
                            if (item.item.startsWith('/')) {
                                item.item = 'https://financetools.com' + item.item;
                            }
                        }
                    });
                }
                
                script.textContent = JSON.stringify(data, null, 2);
            } catch (parseError) {
                console.error('Error parsing schema script:', parseError);
            }
        });
        
        // Generate dynamic FAQ schema based on page content
        generateDynamicFAQSchema();
        
    } catch (error) {
        console.error('Error in updateSchemaData:', error);
    }
}

// Generate FAQ schema from page content - Fixed
function generateDynamicFAQSchema() {
    const faqItems = document.querySelectorAll('.faq-item, .faq-question, [data-faq]');
    
    if (faqItems.length > 0) {
        const faqSchema = {
            "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Loan Calculator",
  "description": "Compare and calculate all types of loans",
  "url": "https://www.allfinancialtools.com/loan-calculator",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
            "@type": "FAQPage",
            "mainEntity": []
        };
        
        faqItems.forEach((item, index) => {
            if (index < 10) { // Limit to 10 FAQs for performance
                const questionElement = item.querySelector('.faq-question') || 
                                       item.querySelector('h3, h4') || 
                                       item;
                const answerElement = item.querySelector('.faq-answer') || 
                                     item.querySelector('p') || 
                                     item.nextElementSibling;
                
                if (questionElement && answerElement) {
                    faqSchema.mainEntity.push({
                        "@type": "Question",
                        "name": questionElement.textContent.trim().substring(0, 150),
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": answerElement.textContent.trim().substring(0, 500)
                        }
                    });
                }
            }
        });
        
        if (faqSchema.mainEntity.length > 0) {
            // Remove existing FAQ schema if present
            const existingFAQ = document.querySelector('script[data-faq-schema]');
            if (existingFAQ) {
                existingFAQ.remove();
            }
            
            // Add new FAQ schema
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute('data-faq-schema', 'dynamic');
            script.textContent = JSON.stringify(faqSchema, null, 2);
            document.head.appendChild(script);
        }
    }
}

// Generate calculator-specific schema - Fixed
function generateCalculatorSchema(calculatorId, calculatorName, inputs, results) {
    const calculatorSchema = {
        "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Loan Calculator",
  "description": "Compare and calculate all types of loans",
  "url": "https://www.allfinancialtools.com/loan-calculator",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
        "@type": "WebApplication",
        "name": calculatorName + " - FinanceTools",
        "url": window.location.href + '#' + calculatorId,
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "INR"
        },
        "featureList": [
            "100% Free",
            "No Registration Required",
            "Instant Results",
            "Mobile Friendly"
        ],
        "screenshot": "https://financetools.com/images/" + calculatorId.replace('-calculator', '') + ".png"
    };
    
    // Add schema to page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.className = 'dynamic-schema';
    script.textContent = JSON.stringify(calculatorSchema, null, 2);
    document.head.appendChild(script);
    
    // Clean up old schemas
    const oldSchemas = document.querySelectorAll('.dynamic-schema');
    if (oldSchemas.length > 5) {
        oldSchemas[0].remove();
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initial update
    updateSchemaData();
    
    // Update schema when calculator is used
    window.addEventListener('calculatorUsed', function(e) {
        if (e.detail && e.detail.calculatorId) {
            generateCalculatorSchema(
                e.detail.calculatorId,
                e.detail.calculatorName,
                e.detail.inputs,
                e.detail.results
            );
        }
    });
    
    // Update schema every hour for freshness
    setInterval(updateSchemaData, 3600000); // 1 hour
});
