// ========================================
// PARTICLE BACKGROUND SYSTEM
// ========================================
const canvas = document.getElementById('particleCanvas');
let ctx = canvas ? canvas.getContext('2d') : null;

if (canvas && ctx) {
    let particles = [];
    let mouseX = 0;
    let mouseY = 0;
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.color = `hsla(${Math.random() * 60 + 200}, 70%, 60%, 0.5)`;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Maus Interaktion
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) {
                const angle = Math.atan2(dy, dx);
                const force = (100 - distance) / 100;
                this.x -= Math.cos(angle) * force * 2;
                this.y -= Math.sin(angle) * force * 2;
            }
            
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
    
    function initParticles() {
        particles = [];
        for (let i = 0; i < 100; i++) {
            particles.push(new Particle());
        }
    }
    
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });
    
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    resizeCanvas();
    initParticles();
    animateParticles();
}

// ========================================
// NAVBAR SCROLL EFFECT & HAMBURGER MENU
// ========================================
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar?.classList.add('scrolled');
    } else {
        navbar?.classList.remove('scrolled');
    }
});

hamburger?.addEventListener('click', () => {
    navMenu?.classList.toggle('active');
    hamburger.classList.toggle('active');
    
    // Hamburger Animation
    const spans = hamburger.querySelectorAll('span');
    if (hamburger.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu?.classList.remove('active');
        hamburger?.classList.remove('active');
        const spans = hamburger?.querySelectorAll('span');
        if (spans) {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
});

// ========================================
// COUNTER ANIMATION
// ========================================
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 20);
}

// Intersection Observer für Counter
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.stat-number');
            counters.forEach(counter => {
                const target = parseInt(counter.dataset.count);
                if (target && counter.textContent === '0') {
                    animateCounter(counter, target);
                }
            });
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const statsSection = document.querySelector('.hero-stats');
if (statsSection) {
    observer.observe(statsSection);
}

// ========================================
// SMOOTH SCROLLING
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================================
// GSAP-LIKE SCROLL ANIMATIONS (Vanilla)
// ========================================
const fadeElements = document.querySelectorAll('.feature-card, .game-showcase-card');

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1, rootMargin: '50px' });

fadeElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    fadeObserver.observe(el);
});

// ========================================
// DYNAMIC YEAR IN FOOTER
// ========================================
const yearElement = document.querySelector('.footer-bottom p');
if (yearElement) {
    const currentYear = new Date().getFullYear();
    yearElement.innerHTML = yearElement.innerHTML.replace('2024', currentYear);
}

// ========================================
// NEWSLETTER FORM HANDLER
// ========================================
const newsletterBtn = document.querySelector('.newsletter-form button');
const newsletterInput = document.querySelector('.newsletter-form input');

newsletterBtn?.addEventListener('click', () => {
    const email = newsletterInput?.value;
    if (email && email.includes('@')) {
        // Speichere in localStorage für Demo
        localStorage.setItem('newsletterEmail', email);
        showNotification('✅ Danke fürs Abonnieren!', 'success');
        newsletterInput.value = '';
    } else if (email) {
        showNotification('❌ Bitte eine gültige Email eingeben!', 'error');
    }
});

// ========================================
// NOTIFICATION SYSTEM
// ========================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4ecdc4' : type === 'error' ? '#ff6b6b' : '#667eea'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========================================
// LAZY LOADING FOR GAME CARDS
// ========================================
const gameCards = document.querySelectorAll('.game-showcase-card');
gameCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// ========================================
// TYPING EFFECT FOR HERO (Optional)
// ========================================
const heroTitle = document.querySelector('.hero-title');
if (heroTitle && heroTitle.querySelector('.gradient-text')) {
    // Just for fun - adds a cursor blink effect
    const cursor = document.createElement('span');
    cursor.textContent = '|';
    cursor.style.animation = 'blink 1s infinite';
    cursor.style.marginLeft = '2px';
    heroTitle.appendChild(cursor);
    
    const blinkStyle = document.createElement('style');
    blinkStyle.textContent = `
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }
    `;
    document.head.appendChild(blinkStyle);
}

// ========================================
// LOCAL STORAGE HIGHSCORE DISPLAY
// ========================================
function displayHighscores() {
    const flappyHighscore = localStorage.getItem('flappyHighscore');
    const jumpHighscore = localStorage.getItem('jumpHighscore');
    const memoryHighscore = localStorage.getItem('memoryHighscore');
    
    // Optional: Display on homepage if there's a highscore section
    console.log('Highscores:', { flappyHighscore, jumpHighscore, memoryHighscore });
}

displayHighscores();

// ========================================
// PRELOADER (Optional - minimal)
// ========================================
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    // Remove any preloader if exists
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.remove(), 500);
    }
});

// ========================================
// TOOLTIP FOR GAME CARDS
// ========================================
gameCards.forEach(card => {
    const gameName = card.querySelector('h3')?.textContent;
    if (gameName) {
        card.setAttribute('data-tooltip', `Spiele ${gameName} jetzt!`);
    }
});

// ========================================
// CONSOLE WELCOME MESSAGE
// ========================================
console.log('%c🎮 GameHub - Coole Spiele Website', 'color: #ff6b6b; font-size: 20px; font-weight: bold;');
console.log('%cBesuche uns auf GitHub & Vercel!', 'color: #4ecdc4; font-size: 14px;');
console.log('%cHighscores werden lokal gespeichert 🏆', 'color: #ffd166; font-size: 12px;');

// ========================================
// PERFORMANCE MONITORING (Dev only)
// ========================================
if (window.performance && window.performance.timing) {
    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
    console.log(`✅ Seite geladen in ${loadTime}ms`);
}

// ========================================
// EXPORT FUNCTIONS FOR GLOBAL USE
// ========================================
window.showNotification = showNotification;
window.displayHighscores = displayHighscores;
