// Gambling Interface Modern JS
document.addEventListener('DOMContentLoaded', function() {
    // Variables
    const navbar = document.getElementById('navbar');
    const themeToggle = document.querySelector('.theme-toggle');
    const scrollToContentBtn = document.querySelector('.scrollToContent');
    const actionButtons = document.querySelectorAll('.action-button');
    
    // Initialize animations
    initParticles();
    animateCounters();
    
    // Theme Toggle
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('gambling-dark-mode', isDarkMode);
    });
    
    // Check for saved theme preference
    if (localStorage.getItem('gambling-dark-mode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Scroll to content button
    if (scrollToContentBtn) {
        scrollToContentBtn.addEventListener('click', function() {
            const contentSection = document.querySelector('.quick-actions');
            if (contentSection) {
                window.scrollTo({
                    top: contentSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Action buttons navigation
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            const targetSection = document.getElementById(target);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            } else {
                // If section doesn't exist, show loading animation
                document.querySelector('.loading-content').style.display = 'flex';
                setTimeout(() => {
                    document.querySelector('.loading-content').style.display = 'none';
                    // Call API to load content
                    loadContent(target);
                }, 2000);
            }
        });
    });
    
    // Mobile menu toggle
    const navbarToggle = document.getElementById('navbar-toggle');
    const navbarLinks = document.querySelector('.navbar-links');
    
    if (navbarToggle && navbarLinks) {
        navbarToggle.addEventListener('click', function() {
            navbarLinks.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Tab interactions for harm sections
    initTabs();
    
    // Hover effects for cards
    initCardHoverEffects();
    
    // Initialize API data loading
    loadGamblingTypes();
});

// Initialize particles animation
function initParticles() {
    const particles = document.getElementById('particles');
    if (!particles) return;
    
    // Create casino-themed particles (dice, cards, chips)
    const particleCount = 30;
    const particleIcons = ['♠', '♥', '♦', '♣', '🎲', '🎰', '💰', '💵'];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        particle.className = 'particle';
        particle.textContent = particleIcons[Math.floor(Math.random() * particleIcons.length)];
        
        // Random position
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        
        // Random size
        const size = Math.random() * 20 + 10;
        particle.style.fontSize = size + 'px';
        
        // Random opacity
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        
        // Animation duration and delay
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 10;
        particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
        
        // Apply particle to the DOM
        particles.appendChild(particle);
    }
}

// Counter animation for statistics
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const step = 30; // Update every 30ms
        const steps = duration / step;
        const increment = target / steps;
        
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = current.toFixed(1);
            }
        }, step);
    });
}

// Initialize tab system
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const target = button.getAttribute('data-tab');
            document.getElementById(target).classList.add('active');
        });
    });
    
    // Set first tab as active by default
    if (tabButtons.length > 0 && tabContents.length > 0) {
        tabButtons[0].classList.add('active');
        tabContents[0].classList.add('active');
    }
}

// Card hover effects
function initCardHoverEffects() {
    const cards = document.querySelectorAll('.gambling-type-card, .harm-impact-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// Load gambling types from API
function loadGamblingTypes() {
    const gamblingTypesGrid = document.getElementById('gamblingTypesGrid');
    if (!gamblingTypesGrid) return;
    
    // Show loading spinner
    document.querySelector('.loading-content').style.display = 'flex';
    
    // Simulate API call (replace with actual API call)
    setTimeout(() => {
        fetch('../api/gambling-types')
            .then(response => response.json())
            .then(data => {
                // Clear loading spinner
                document.querySelector('.loading-content').style.display = 'none';
                
                // Clear existing content
                gamblingTypesGrid.innerHTML = '';
                
                // Populate with API data
                data.forEach(type => {
                    const card = createGamblingTypeCard(type);
                    gamblingTypesGrid.appendChild(card);
                });
                
                // Reinitialize hover effects
                initCardHoverEffects();
            })
            .catch(error => {
                console.error('Error loading gambling types:', error);
                document.querySelector('.loading-content').style.display = 'none';
                
                // Show fallback content with error message
                gamblingTypesGrid.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i><p>Không thể tải dữ liệu. Vui lòng thử lại sau.</p></div>';
            });
    }, 1500);
}

// Create gambling type card element
function createGamblingTypeCard(type) {
    const card = document.createElement('div');
    card.className = 'gambling-type-card';
    card.setAttribute('data-type', type.slug);
    
    const icon = document.createElement('div');
    icon.className = 'type-icon';
    icon.innerHTML = `<i class="fas fa-${type.icon}"></i>`;
    
    const title = document.createElement('h3');
    title.textContent = type.name;
    
    const content = document.createElement('div');
    content.className = 'type-content';
    
    const list = document.createElement('ul');
    type.examples.forEach(example => {
        const item = document.createElement('li');
        item.textContent = example;
        list.appendChild(item);
    });
    
    const dangerLevel = document.createElement('div');
    dangerLevel.className = `danger-level ${type.dangerLevel}`;
    dangerLevel.textContent = `Mức độ nguy hại: ${getDangerLevelText(type.dangerLevel)}`;
    
    content.appendChild(list);
    content.appendChild(dangerLevel);
    
    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(content);
    
    return card;
}

// Get text representation of danger level
function getDangerLevelText(level) {
    switch (level) {
        case 'low': return 'Thấp';
        case 'medium': return 'Trung bình';
        case 'high': return 'Cao';
        case 'extreme': return 'Cực cao';
        default: return 'Không xác định';
    }
}

// Load specific content section
function loadContent(target) {
    // Implement content loading based on section
    console.log(`Loading content for: ${target}`);
    
    // Specific section loading handlers
    switch (target) {
        case 'warning-signs':
            loadWarningSigns();
            break;
        case 'online-gambling':
            loadOnlineGamblingRisks();
            break;
        case 'test-awareness':
            showAwarenessTest();
            break;
        case 'support-resources':
            loadSupportResources();
            break;
        default:
            console.error('Unknown content target:', target);
    }
}

// Load warning signs section
function loadWarningSigns() {
    // Implementation for loading warning signs
    console.log('Loading warning signs...');
}

// Load online gambling risks
function loadOnlineGamblingRisks() {
    // Implementation for loading online gambling risks
    console.log('Loading online gambling risks...');
}

// Show awareness test
function showAwarenessTest() {
    // Implementation for awareness test
    console.log('Showing awareness test...');
}

// Load support resources
function loadSupportResources() {
    // Implementation for support resources
    console.log('Loading support resources...');
} 