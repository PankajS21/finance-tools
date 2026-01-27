// seo-performance.js - Performance monitoring only
(function() {
    'use strict';
    
    // Monitor Core Web Vitals
    const reportWebVitals = (metric) => {
        console.log('[Performance]', metric.name, Math.round(metric.value));
        
        // Check Core Web Vitals thresholds
        if (metric.name === 'LCP' && metric.value > 2500) {
            console.warn('[Performance Warning] LCP too high:', metric.value);
        }
        if (metric.name === 'CLS' && metric.value > 0.1) {
            console.warn('[Performance Warning] CLS too high:', metric.value);
        }
        if (metric.name === 'FID' && metric.value > 100) {
            console.warn('[Performance Warning] FID too high:', metric.value);
        }
    };
    
    // Track page load time
    const trackPageLoad = () => {
        if (performance && performance.timing) {
            const timing = performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
            
            // console.log('[Performance] Page loaded in', loadTime, 'ms');
            // console.log('[Performance] DOM ready in', domReadyTime, 'ms');
            
            // Send to analytics if available
            if (window.gtag && loadTime > 0) {
                gtag('event', 'performance_timing', {
                    'page_load_time': loadTime,
                    'dom_ready_time': domReadyTime,
                    'event_category': 'Performance',
                    'non_interaction': true
                });
            }
        }
    };
    
    // Monitor memory usage
    const monitorMemory = () => {
        if (performance && performance.memory) {
            setInterval(() => {
                const memory = performance.memory;
                const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
                
                if (usedMB > 100) {
                    console.warn('[Performance Warning] High memory usage:', usedMB + 'MB');
                }
            }, 30000);
        }
    };
    
    // Monitor network requests
    const monitorNetwork = () => {
        if (performance && performance.getEntriesByType) {
            const resources = performance.getEntriesByType('resource');
            const slowResources = resources.filter(r => r.duration > 1000);
            
            if (slowResources.length > 0) {
                console.warn('[Performance Warning] Slow resources found:', slowResources.length);
                slowResources.forEach(res => {
                    console.log('-', res.name, 'took', Math.round(res.duration), 'ms');
                });
            }
        }
    };
    
    // Initialize performance monitoring
    const initPerformanceMonitoring = () => {
        // Wait for page to fully load
        if (document.readyState === 'complete') {
            trackPageLoad();
            monitorMemory();
            monitorNetwork();
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    trackPageLoad();
                    monitorMemory();
                    monitorNetwork();
                }, 1000);
            });
        }
        
        // Monitor Core Web Vitals if supported
        if (typeof window.PerformanceObserver !== 'undefined') {
            try {
                // LCP
                const lcpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    reportWebVitals({
                        name: 'LCP',
                        value: lastEntry.startTime
                    });
                });
                lcpObserver.observe({type: 'largest-contentful-paint', buffered: true});
                
                // CLS
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                            reportWebVitals({
                                name: 'CLS',
                                value: clsValue
                            });
                        }
                    }
                });
                clsObserver.observe({type: 'layout-shift', buffered: true});
                
                // FID
                const fidObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        reportWebVitals({
                            name: 'FID',
                            value: entry.processingStart - entry.startTime
                        });
                    });
                });
                fidObserver.observe({type: 'first-input', buffered: true});
                
            } catch (e) {
                console.error('[Performance] Error setting up observers:', e);
            }
        }
    };
    
    // Start monitoring
    document.addEventListener('DOMContentLoaded', initPerformanceMonitoring);
    
})();