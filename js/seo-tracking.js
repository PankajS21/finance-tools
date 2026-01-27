// Track calculator usage - Fixed
function trackCalculatorUsage(calculatorName, inputs) {
    if (window.gtag) {
        const safeInputs = {};
        
        // Sanitize inputs to remove sensitive data
        Object.keys(inputs).forEach(key => {
            if (!key.includes('password') && !key.includes('credit') && !key.includes('ssn')) {
                safeInputs[key] = inputs[key];
            }
        });
        
        gtag('event', 'calculator_used', {
            'calculator_name': calculatorName,
            'event_category': 'Calculator Usage',
            'non_interaction': false
        });
        
        // Enhanced tracking for specific calculators
        if (calculatorName === 'EMI Calculator') {
            gtag('event', 'emi_calculation', {
                'loan_amount': inputs.loanAmount || 0,
                'interest_rate': inputs.interestRate || 0,
                'tenure': inputs.tenure || 0,
                'event_category': 'Loan Calculators'
            });
        }
        
        if (calculatorName === 'SIP Calculator') {
            gtag('event', 'sip_calculation', {
                'monthly_amount': inputs.monthlyAmount || 0,
                'period': inputs.period || 0,
                'expected_return': inputs.expectedReturn || 0,
                'event_category': 'Investment Calculators'
            });
        }
    }
}

// Track scroll depth - Fixed
let scrollDepthTracked = {
    25: false,
    50: false,
    75: false,
    90: false
};

window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset + window.innerHeight;
    const maxScroll = document.body.scrollHeight;
    const depthPercentage = Math.round((currentScroll / maxScroll) * 100);
    
    // Track scroll milestones
    const milestones = [25, 50, 75, 90];
    milestones.forEach(milestone => {
        if (depthPercentage >= milestone && !scrollDepthTracked[milestone]) {
            scrollDepthTracked[milestone] = true;
            
            if (window.gtag) {
                gtag('event', 'scroll_' + milestone + '_percent', {
                    'event_category': 'Engagement',
                    'event_label': 'Scroll Depth',
                    'value': milestone,
                    'non_interaction': true
                });
            }
        }
    });
    
    // Track 100% scroll
    if (depthPercentage >= 99 && !scrollDepthTracked[100]) {
        scrollDepthTracked[100] = true;
        if (window.gtag) {
            gtag('event', 'scroll_100_percent', {
                'event_category': 'Engagement',
                'event_label': 'Full Scroll',
                'non_interaction': true
            });
        }
    }
});

// Track time on page - Fixed
let timeOnPageSeconds = 0;
const timeTrackingInterval = setInterval(() => {
    timeOnPageSeconds += 1;
    
    // Track time milestones
    const timeMilestones = [10, 30, 60, 120, 300]; // seconds
    
    timeMilestones.forEach(seconds => {
        if (timeOnPageSeconds === seconds) {
            if (window.gtag) {
                gtag('event', 'time_on_page_' + seconds + 's', {
                    'event_category': 'Engagement',
                    'event_label': 'Time Spent',
                    'value': seconds,
                    'non_interaction': true
                });
            }
        }
    });
    
    // Stop tracking after 10 minutes
    if (timeOnPageSeconds >= 600) {
        clearInterval(timeTrackingInterval);
    }
}, 1000);

// Track user engagement with calculators
document.addEventListener('DOMContentLoaded', function() {
    // Track calculator tab clicks
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const calculatorName = this.getAttribute('data-calc') || this.textContent;
            
            if (window.gtag) {
                gtag('event', 'calculator_tab_click', {
                    'calculator_name': calculatorName,
                    'event_category': 'Navigation',
                    'event_label': 'Calculator Tabs'
                });
            }
        });
    });
    
    // Track form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (window.gtag) {
                gtag('event', 'form_submission', {
                    'form_id': this.id || 'unknown_form',
                    'event_category': 'Forms',
                    'event_label': 'Form Submission'
                });
            }
        });
    });
    
    // Track outbound links
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="financetools.com"])');
    externalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.gtag) {
                gtag('event', 'outbound_link_click', {
                    'link_url': this.href,
                    'link_text': this.textContent,
                    'event_category': 'Outbound Links',
                    'event_label': 'External Navigation'
                });
            }
        });
    });
});
