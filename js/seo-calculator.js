// Calculator Integration with SEO Tracking - Fixed
class CalculatorSEO {
    constructor() {
        this.calculatorEvents = [];
        this.init();
    }
    
    init() {
        // Listen for calculator usage
        this.setupCalculatorTracking();
        this.setupPerformanceTracking();
        this.setupErrorTracking();
    }
    
    setupCalculatorTracking() {
        // Track all calculator buttons
        const calcButtons = document.querySelectorAll('[onclick*="calculate"], .btn-primary, .calculator-actions button');
        
        calcButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const calculatorId = this.getCalculatorId(button);
                const calculatorName = this.getCalculatorName(button);
                
                // Dispatch custom event
                const event = new CustomEvent('calculatorUsed', {
                    detail: {
                        calculatorId: calculatorId,
                        calculatorName: calculatorName,
                        timestamp: new Date().toISOString(),
                        url: window.location.href
                    }
                });
                window.dispatchEvent(event);
                
                // Track in analytics
                this.trackCalculatorEvent(calculatorId, calculatorName);
            });
        });
    }
    
    getCalculatorId(element) {
        // Try to find the calculator ID from various sources
        const calculatorSection = element.closest('.calculator-content');
        if (calculatorSection && calculatorSection.id) {
            return calculatorSection.id;
        }
        
        const tabButton = element.closest('.tab-btn');
        if (tabButton && tabButton.dataset.calc) {
            return tabButton.dataset.calc + '-calculator';
        }
        
        // Fallback to page hash
        return window.location.hash.replace('#', '') || 'unknown-calculator';
    }
    
    getCalculatorName(element) {
        const calculatorHeader = element.closest('.calculator-content')?.querySelector('.calculator-header h3');
        if (calculatorHeader) {
            return calculatorHeader.textContent.trim();
        }
        
        const tabButton = element.closest('.tab-btn');
        if (tabButton) {
            return tabButton.textContent.trim();
        }
        
        return 'Financial Calculator';
    }
    
    trackCalculatorEvent(calculatorId, calculatorName) {
        if (window.gtag) {
            gtag('event', 'calculator_interaction', {
                'calculator_id': calculatorId,
                'calculator_name': calculatorName,
                'event_category': 'Calculator Engagement',
                'event_label': 'Calculator Usage',
                'non_interaction': false
            });
        }
        
        // Store locally for session analysis
        this.calculatorEvents.push({
            id: calculatorId,
            name: calculatorName,
            time: new Date().toISOString()
        });
        
        // Update local storage for returning users
        this.updateUserCalculatorHistory(calculatorId);
    }
    
    updateUserCalculatorHistory(calculatorId) {
        try {
            const history = JSON.parse(localStorage.getItem('calculatorHistory') || '[]');
            
            // Add new entry
            history.push({
                id: calculatorId,
                timestamp: new Date().toISOString(),
                page: window.location.pathname
            });
            
            // Keep only last 50 entries
            if (history.length > 50) {
                history.splice(0, history.length - 50);
            }
            
            localStorage.setItem('calculatorHistory', JSON.stringify(history));
        } catch (e) {
            console.error('Error updating calculator history:', e);
        }
    }
    
    setupPerformanceTracking() {
        // Track calculation time
        const originalFunctions = {};
        
        // Wrap calculator functions
        ['calculateEMI', 'calculateSIP', 'calculateTax', 'calculatePPF'].forEach(funcName => {
            if (window[funcName]) {
                originalFunctions[funcName] = window[funcName];
                
                window[funcName] = function(...args) {
                    const startTime = performance.now();
                    const result = originalFunctions[funcName].apply(this, args);
                    const endTime = performance.now();
                    const duration = endTime - startTime;
                    
                    // Track performance
                    if (duration > 100) { // If calculation takes more than 100ms
                        console.warn(`Calculator ${funcName} took ${Math.round(duration)}ms`);
                        
                        if (window.gtag) {
                            gtag('event', 'slow_calculation', {
                                'calculator_function': funcName,
                                'calculation_time': Math.round(duration),
                                'event_category': 'Performance',
                                'non_interaction': true
                            });
                        }
                    }
                    
                    return result;
                };
            }
        });
    }
    
    setupErrorTracking() {
        // Track calculator errors
        window.addEventListener('error', (e) => {
            if (e.message.includes('calculate') || e.filename.includes('calculator')) {
                if (window.gtag) {
                    gtag('event', 'calculator_error', {
                        'error_message': e.message.substring(0, 100),
                        'error_file': e.filename,
                        'error_line': e.lineno,
                        'event_category': 'Errors',
                        'non_interaction': true
                    });
                }
            }
        });
        
        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            if (e.reason && e.reason.toString().includes('calculate')) {
                if (window.gtag) {
                    gtag('event', 'calculator_promise_error', {
                        'error_reason': e.reason.toString().substring(0, 100),
                        'event_category': 'Errors',
                        'non_interaction': true
                    });
                }
            }
        });
    }
    
    // Generate usage report (for debugging)
    getUsageReport() {
        return {
            totalCalculations: this.calculatorEvents.length,
            uniqueCalculators: [...new Set(this.calculatorEvents.map(e => e.id))].length,
            firstCalculation: this.calculatorEvents[0]?.time,
            lastCalculation: this.calculatorEvents[this.calculatorEvents.length - 1]?.time
        };
    }
}

// Initialize calculator SEO tracking
document.addEventListener('DOMContentLoaded', function() {
    window.calculatorSEO = new CalculatorSEO();
    
    // Expose for debugging
    console.log('Calculator SEO tracking initialized');
    
    // Send page view event for calculators
    if (window.location.hash.includes('calculator')) {
        setTimeout(() => {
            if (window.gtag) {
                gtag('event', 'calculator_page_view', {
                    'calculator_id': window.location.hash.replace('#', ''),
                    'event_category': 'Page Views',
                    'non_interaction': true
                });
            }
        }, 1000);
    }
});
