/**
 * Alcohol Page Interactive JavaScript
 * Enhances the user experience with interactive elements and animations
 */

// Initialize all functions when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate on Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
    
    // Initialize stat counters
    animateCounters();
    
    // Setup interactive risk meter
    setupRiskMeter();
    
    // Create bubble animations
    createRandomBubbles();
    
    // Setup hover effects for cards
    setupCardEffects();
    
    // Setup scrolling effects
    setupScrollEffects();
    
    // Check for hash in URL to scroll to specific section
    handleHashScroll();
});

/**
 * Animate number counters with easing effect
 */
function animateCounters() {
    const counterElements = document.querySelectorAll('.counter-value');
    
    counterElements.forEach(counter => {
        const targetValue = parseFloat(counter.getAttribute('data-count'));
        const duration = 2000; // 2 seconds
        const frameDuration = 1000/60; // 60fps
        const totalFrames = Math.round(duration / frameDuration);
        
        let frame = 0;
        let currentValue = 0;
        
        const animate = () => {
            frame++;
            const progress = frame / totalFrames;
            const easedProgress = progress < 0.5
                ? 2 * progress * progress
                : -1 + (4 - 2 * progress) * progress; // Ease in-out quadratic
            
            currentValue = easedProgress * targetValue;
            
            const formattedValue = Number.isInteger(targetValue) 
                ? Math.floor(currentValue).toLocaleString()
                : currentValue.toFixed(1);
            
            counter.textContent = formattedValue;
            
            if (frame < totalFrames) {
                requestAnimationFrame(animate);
            } else {
                counter.textContent = targetValue.toLocaleString();
            }
        };
        
        requestAnimationFrame(animate);
    });
}

/**
 * Setup interactive risk meter functionality
 */
function setupRiskMeter() {
    document.querySelectorAll('.drink-option').forEach(option => {
        option.addEventListener('click', function() {
            // Get risk value
            const riskValue = parseInt(this.getAttribute('data-risk'));
            
            // Remove active class from all options
            document.querySelectorAll('.drink-option').forEach(opt => opt.classList.remove('active'));
            
            // Add active class to current option
            this.classList.add('active');
            
            // Update indicator position
            const indicator = document.querySelector('.risk-indicator');
            indicator.style.left = `${riskValue}%`;
            
            // Get risk data from alcohol_info.js
            const riskData = alcoholData.riskInfo[riskValue.toString()];
            
            // Update drink info
            const drinkInfo = document.querySelector('.drink-info');
            drinkInfo.innerHTML = `
                <p class="mb-1"><strong>Mức độ rủi ro: ${riskValue}%</strong></p>
                <p class="mb-1">${riskData.description}</p>
                <p class="mb-0"><strong>Khuyến nghị:</strong> ${riskData.recommendation}</p>
            `;
            
            // Update liquid fill
            const liquidFill = document.querySelector('.liquid-fill');
            liquidFill.style.height = `${riskValue}%`;
            
            // Update liquid label
            const liquidLabel = document.querySelector('.liquid-label');
            liquidLabel.textContent = `${riskValue}%`;
            
            // Change color based on risk level
            let liquidColor;
            if (riskValue < 25) {
                liquidColor = '#2ecc71'; // Green - low risk
            } else if (riskValue < 50) {
                liquidColor = '#f39c12'; // Orange - medium risk
            } else {
                liquidColor = '#e74c3c'; // Red - high risk
            }
            
            liquidFill.style.background = liquidColor;
            
            // Update SVG wave
            const svgWave = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 350 20' xmlns='http://www.w3.org/2000/svg'><path d='M0,20 Q50,0 100,20 Q150,40 200,20 Q250,0 300,20 Q350,40 400,20 L400,150 L0,150 Z' fill='${liquidColor.replace('#', '%23')}'/></svg>")`;
            liquidFill.style.setProperty('--wave-background', svgWave, 'important');
            
            // Add heartbeat animation for high risk
            const liquidContainer = document.querySelector('.liquid-container');
            if (riskValue >= 60) {
                liquidContainer.classList.add('heartbeat');
            } else {
                liquidContainer.classList.remove('heartbeat');
            }
        });
    });
    
    // Activate first option by default
    document.querySelector('.drink-option').click();
}

/**
 * Create random bubble animations for hero section
 */
function createRandomBubbles() {
    const bubblesContainer = document.querySelector('.bubbles-container');
    if (bubblesContainer) {
        for (let i = 0; i < 15; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            
            // Random size
            const size = Math.floor(Math.random() * 20) + 10; // 10-30px
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            
            // Random position
            const left = Math.floor(Math.random() * 100);
            bubble.style.left = `${left}%`;
            
            // Random animation duration
            const duration = Math.floor(Math.random() * 8) + 8; // 8-16s
            bubble.style.animationDuration = `${duration}s`;
            
            // Random delay
            const delay = Math.floor(Math.random() * 5);
            bubble.style.animationDelay = `${delay}s`;
            
            bubblesContainer.appendChild(bubble);
        }
    }
}

/**
 * Setup enhancement effects for cards
 */
function setupCardEffects() {
    // 3D tilt effect on hover for cards
    document.querySelectorAll('.info-card').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const cardRect = this.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            // Calculate distance from center in percentage (-50 to 50)
            const rotateY = ((mouseX - cardCenterX) / (cardRect.width / 2)) * 5;
            const rotateX = ((cardCenterY - mouseY) / (cardRect.height / 2)) * 5;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            this.style.transition = 'transform 0.5s ease';
        });
    });
    
    // Highlight effect on hover for alcohol type cards
    document.querySelectorAll('.alcohol-type-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.type-icon i');
            icon.classList.add('fa-bounce');
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.type-icon i');
            icon.classList.remove('fa-bounce');
        });
    });
}

/**
 * Setup scroll-triggered effects
 */
function setupScrollEffects() {
    // Parallax scrolling effect for hero section
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        const heroSection = document.querySelector('.hero-alcohol');
        
        if (heroSection) {
            // Move background slightly up as user scrolls down
            heroSection.style.backgroundPosition = `center ${scrollPosition * 0.4}px`;
        }
    });
}

/**
 * Handle scrolling to hash in URL
 */
function handleHashScroll() {
    if (window.location.hash) {
        const element = document.querySelector(window.location.hash);
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    }
}

/**
 * Apply filters for information cards
 */
function applyFilters() {
    const selectedAlcoholCategory = document.getElementById('filter-alcohol-category').value;
    const selectedAlcoholTopic = document.getElementById('filter-alcohol-topic').value;
    const searchTerm = document.getElementById('search-info').value.toLowerCase();
    const infoItems = document.querySelectorAll('#info-list-container .info-item');
    let infoFound = 0;

    infoItems.forEach(item => {
        const alcoholCategory = item.dataset.alcoholCategory;
        const alcoholTopic = item.dataset.alcoholTopic;
        const title = item.querySelector('.card-title').textContent.toLowerCase();
        const text = item.querySelector('.card-text').textContent.toLowerCase();
        
        const categoryMatch = selectedAlcoholCategory === "" || selectedAlcoholCategory === alcoholCategory;
        const topicMatch = selectedAlcoholTopic === "" || selectedAlcoholTopic === alcoholTopic;
        const searchTermMatch = searchTerm === "" || title.includes(searchTerm) || text.includes(searchTerm);

        if (categoryMatch && topicMatch && searchTermMatch) {
            item.style.display = 'block';
            infoFound++;
        } else {
            item.style.display = 'none';
        }
    });
    
    const noInfoMessage = document.getElementById('no-info-message');
    if (infoFound === 0) {
        noInfoMessage.classList.remove('d-none');
    } else {
        noInfoMessage.classList.add('d-none');
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Toast content
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast, {
        animation: true,
        autohide: true,
        delay: 5000
    });
    bsToast.show();
    
    // Remove toast after hiding
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
} 