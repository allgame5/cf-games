// ========================================
// NEON RUNNER - JUMP 'N' RUN GAME
// ========================================

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameRunning = false;
let gamePaused = false;
let gameStarted = false;
let animationId = null;
let frameCount = 0;

// Score System
let score = 0;
let highscore = localStorage.getItem('jumpHighscore') || 0;
document.getElementById('highscore').textContent = highscore;

// Game Speed
let gameSpeed = 5;
let speedLevel = 1;

// Player
const player = {
    x: 150,
    y: 0,
    width: 35,
    height: 45,
    velocityY: 0,
    isJumping: false,
    groundY: canvas.height - 80,
    invincible: false,
    invincibleTimer: 0,
    color: '#00ff88'
};

player.y = player.groundY - player.height;

// Obstacles Array
let obstacles = [];
let frameSinceLastObstacle = 0;
let obstacleSpawnRate = 70;

// Power-Ups
let powerups = [];
let activePowerup = null;
let powerupTimer = 0;

// Particles
let particles = [];

// Background Elements
let clouds = [];
let groundDecorations = [];

// Initialize
function init() {
    player.y = player.groundY - player.height;
    player.velocityY = 0;
    player.isJumping = false;
    player.invincible = false;
    score = 0;
    gameSpeed = 5;
    speedLevel = 1;
    obstacles = [];
    powerups = [];
    particles = [];
    frameCount = 0;
    frameSinceLastObstacle = 0;
    activePowerup = null;
    
    document.getElementById('score').textContent = score;
    document.getElementById('speedLevel').textContent = speedLevel;
    document.getElementById('powerupIndicator').style.display = 'none';
    
    // Create background elements
    createClouds();
    createGroundDecorations();
}

// Create Clouds
function createClouds() {
    clouds = [];
    for(let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height - 200),
            width: 60 + Math.random() * 40,
            height: 30 + Math.random() * 20,
            speed: 0.5 + Math.random() * 1
        });
    }
}

// Create Ground Decorations
function createGroundDecorations() {
    groundDecorations = [];
    for(let i = 0; i < 20; i++) {
        groundDecorations.push({
            x: Math.random() * canvas.width * 2,
            type: Math.floor(Math.random() * 3),
            width: 20 + Math.random() * 20,
            height: 5 + Math.random() * 10
        });
    }
}

// Particle Class
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = (Math.random() - 0.5) * 5 - 3;
        this.size = Math.random() * 4 + 2;
        this.color = color || '#00ff88';
        this.life = 1;
        this.decay = 0.02;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2;
        this.life -= this.decay;
        return this.life > 0;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

// Obstacle Class
class Obstacle {
    constructor() {
        this.x = canvas.width;
        this.width = 30;
        this.height = 45;
        this.y = player.groundY - this.height;
        this.type = Math.floor(Math.random() * 4);
        this.passed = false;
        this.color = this.getColor();
    }
    
    getColor() {
        const colors = ['#ff006e', '#ffbe0b', '#9d4edd', '#00d4ff'];
        return colors[this.type];
    }
    
    draw() {
        // Shadow
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        // Main body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Details based on type
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        if(this.type === 0) {
            // Spikes
            for(let i = 0; i < 3; i++) {
                ctx.fillRect(this.x + 5 + i*10, this.y - 10, 5, 10);
            }
        } else if(this.type === 1) {
            // Eyes
            ctx.fillStyle = 'white';
            ctx.fillRect(this.x + 5, this.y + 10, 6, 6);
            ctx.fillRect(this.x + 19, this.y + 10, 6, 6);
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x + 6, this.y + 11, 3, 3);
            ctx.fillRect(this.x + 20, this.y + 11, 3, 3);
        } else if(this.type === 2) {
            // Stripes
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            for(let i = 0; i < 3; i++) {
                ctx.fillRect(this.x + 5, this.y + 10 + i*12, 20, 5);
            }
        } else {
            // Glow effect
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 15;
        }
        
        ctx.shadowBlur = 0;
    }
    
    update() {
        this.x -= gameSpeed;
    }
}

// PowerUp Class
class PowerUp {
    constructor() {
        this.x = canvas.width;
        this.width = 30;
        this.height = 30;
        this.y = player.groundY - this.height - 20;
        this.type = Math.random() > 0.5 ? 'shield' : 'slowmo';
        this.passed = false;
    }
    
    draw() {
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.type === 'shield' ? '#00ff88' : '#00d4ff';
        
        ctx.fillStyle = this.type === 'shield' ? '#00ff88' : '#00d4ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Icon
        ctx.font = `${this.width - 10}px Arial`;
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 0;
        ctx.fillText(this.type === 'shield' ? '🛡️' : '⏪', this.x + 5, this.y + 25);
    }
    
    update() {
        this.x -= gameSpeed;
    }
}

// Draw Player (Detailed Character)
function drawPlayer() {
    ctx.save();
    
    // Shadow
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.invincible ? '#ff006e' : player.color;
    
    // Body
    ctx.fillStyle = player.invincible ? '#ff006e' : player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Head
    ctx.fillStyle = '#ffbe0b';
    ctx.beginPath();
    ctx.arc(player.x + player.width/2, player.y - 15, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (with animation)
    const eyeBlink = Math.sin(Date.now() * 0.005) > 0.95;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(player.x + player.width - 10, player.y - 20, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + 10, player.y - 20, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#2c3e50';
    if(!eyeBlink) {
        ctx.beginPath();
        ctx.arc(player.x + player.width - 9, player.y - 19, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(player.x + 11, player.y - 19, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Cape animation
    const capeAngle = Math.sin(Date.now() * 0.01) * 0.3;
    ctx.fillStyle = '#ff006e';
    ctx.beginPath();
    ctx.moveTo(player.x - 10, player.y + 10);
    ctx.lineTo(player.x - 25, player.y + 20 + capeAngle * 10);
    ctx.lineTo(player.x - 10, player.y + 30);
    ctx.fill();
    
    // Legs animation while jumping
    if(player.isJumping) {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x + 5, player.y + player.height, 8, 12);
        ctx.fillRect(player.x + player.width - 13, player.y + player.height, 8, 12);
    }
    
    ctx.shadowBlur = 0;
    ctx.restore();
}

// Draw Background with Parallax
function drawBackground() {
    // Gradient Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0a2a');
    gradient.addColorStop(0.5, '#1a1a3a');
    gradient.addColorStop(1, '#2a1a3a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Stars
    ctx.fillStyle = 'white';
    for(let i = 0; i < 100; i++) {
        if(Math.sin(Date.now() * 0.001 + i) > 0.8) {
            ctx.fillRect((i * 131) % canvas.width, (i * 253) % (canvas.height - 200), 2, 2);
        }
    }
    
    // Clouds
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    clouds.forEach(cloud => {
        ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);
        cloud.x -= cloud.speed;
        if(cloud.x + cloud.width < 0) cloud.x = canvas.width;
    });
    
    // Ground with gradient
    const groundGrad = ctx.createLinearGradient(0, player.groundY, 0, canvas.height);
    groundGrad.addColorStop(0, '#2d6a4f');
    groundGrad.addColorStop(1, '#1b4332');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, player.groundY, canvas.width, canvas.height - player.groundY);
    
    // Ground line
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 20]);
    ctx.beginPath();
    ctx.moveTo(0, player.groundY - 5);
    ctx.lineTo(canvas.width, player.groundY - 5);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Ground decorations
    groundDecorations.forEach(dec => {
        ctx.fillStyle = '#40916c';
        ctx.fillRect(dec.x, player.groundY - dec.height, dec.width, dec.height);
        dec.x -= gameSpeed * 0.5;
        if(dec.x + dec.width < 0) dec.x = canvas.width;
    });
}

// Update Game Logic
function updateGame() {
    if(!gameRunning || gamePaused) return;
    
    // Update player physics
    player.velocityY += 0.8;
    player.y += player.velocityY;
    
    if(player.y >= player.groundY - player.height) {
        player.y = player.groundY - player.height;
        player.isJumping = false;
        player.velocityY = 0;
    }
    
    if(player.y < 0) {
        player.y = 0;
        if(player.velocityY < 0) player.velocityY = 0;
    }
    
    // Update invincibility
    if(player.invincible) {
        player.invincibleTimer--;
        if(player.invincibleTimer <= 0) {
            player.invincible = false;
            player.color = '#00ff88';
        } else {
            // Blinking effect
            player.color = Math.floor(Date.now() / 100) % 2 === 0 ? '#ff006e' : '#00ff88';
        }
    }
    
    // Spawn obstacles
    frameSinceLastObstacle++;
    if(frameSinceLastObstacle >= obstacleSpawnRate && gameRunning) {
        frameSinceLastObstacle = 0;
        obstacles.push(new Obstacle());
        
        // Spawn power-up occasionally
        if(Math.random() < 0.2 && !activePowerup) {
            powerups.push(new PowerUp());
        }
        
        // Increase difficulty
        if(score > 0 && score % 300 === 0) {
            gameSpeed += 0.5;
            speedLevel = Math.floor(gameSpeed - 4);
            document.getElementById('speedLevel').textContent = speedLevel;
            obstacleSpawnRate = Math.max(30, obstacleSpawnRate - 2);
        }
    }
    
    // Update obstacles
    for(let i = 0; i < obstacles.length; i++) {
        obstacles[i].update();
        
        // Collision detection
        if(!player.invincible && 
           player.x < obstacles[i].x + obstacles[i].width &&
           player.x + player.width > obstacles[i].x &&
           player.y < obstacles[i].y + obstacles[i].height &&
           player.y + player.height > obstacles[i].y) {
            gameOver();
            return;
        }
        
        // Score increment
        if(!obstacles[i].passed && obstacles[i].x + obstacles[i].width < player.x) {
            obstacles[i].passed = true;
            score += 10;
            document.getElementById('score').textContent = score;
            
            // Create score particles
            for(let j = 0; j < 10; j++) {
                particles.push(new Particle(player.x + player.width/2, player.y, '#ffbe0b'));
            }
            
            if(score > highscore) {
                highscore = score;
                document.getElementById('highscore').textContent = highscore;
                localStorage.setItem('jumpHighscore', highscore);
            }
        }
        
        // Remove offscreen obstacles
        if(obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            i--;
        }
    }
    
    // Update power-ups
    for(let i = 0; i < powerups.length; i++) {
        powerups[i].update();
        
        // Collision with power-up
        if(player.x < powerups[i].x + powerups[i].width &&
           player.x + player.width > powerups[i].x &&
           player.y < powerups[i].y + powerups[i].height &&
           player.y + player.height > powerups[i].y) {
            
            activePowerup = powerups[i].type;
            powerupTimer = 300;
            
            // Show power-up indicator
            document.getElementById('powerupIcon').textContent = activePowerup === 'shield' ? '🛡️' : '⏪';
            document.getElementById('powerupText').textContent = activePowerup === 'shield' ? 'SHIELD ACTIVE' : 'SLOW MO';
            document.getElementById('powerupIndicator').style.display = 'flex';
            
            // Apply power-up effect
            if(activePowerup === 'shield') {
                player.invincible = true;
                player.invincibleTimer = 300;
            } else if(activePowerup === 'slowmo') {
                gameSpeed = 3;
            }
            
            // Create particles
            for(let j = 0; j < 20; j++) {
                particles.push(new Particle(powerups[i].x, powerups[i].y, '#00ff88'));
            }
            
            powerups.splice(i, 1);
            i--;
        } else if(powerups[i].x + powerups[i].width < 0) {
            powerups.splice(i, 1);
            i--;
        }
    }
    
    // Update power-up timer
    if(activePowerup) {
        powerupTimer--;
        const percent = (powerupTimer / 300) * 100;
        document.getElementById('powerupTimer').style.width = `${percent}%`;
        
        if(powerupTimer <= 0) {
            activePowerup = null;
            document.getElementById('powerupIndicator').style.display = 'none';
            if(!player.invincible) gameSpeed = 5 + Math.floor(score / 300);
        }
    }
    
    // Update particles
    for(let i = 0; i < particles.length; i++) {
        if(!particles[i].update()) {
            particles.splice(i, 1);
            i--;
        }
    }
    
    // Jump particles
    if(player.isJumping && player.velocityY < 0) {
        particles.push(new Particle(player.x + player.width/2, player.y + player.height, player.color));
    }
}

// Draw everything
function draw() {
    drawBackground();
    
    // Draw power-ups
    powerups.forEach(p => p.draw());
    
    // Draw obstacles
    obstacles.forEach(o => o.draw());
    
    // Draw particles
    particles.forEach(p => p.draw());
    
    // Draw player
    drawPlayer();
    
    // Draw score on canvas
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(`SPEED: ${gameSpeed.toFixed(1)}`, 20, 50);
    
    // Draw combo effect
    if(score > 0 && frameCount % 10 === 0) {
        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = '#ffbe0b';
        ctx.shadowBlur = 10;
        ctx.fillText(`+10`, player.x - 20, player.y);
        ctx.shadowBlur = 0;
    }
}

// Jump function
function jump() {
    if(!gameRunning || gamePaused) return;
    if(!player.isJumping && gameStarted) {
        player.velocityY = -10;
        player.isJumping = true;
        
        // Jump sound effect (visual)
        for(let i = 0; i < 15; i++) {
            particles.push(new Particle(player.x + player.width/2, player.y + player.height, '#00ff88'));
        }
    }
}

// Game Over
function gameOver() {
    gameRunning = false;
    gameStarted = false;
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverlay').style.display = 'flex';
    
    if(animationId) {
        cancelAnimationFrame(animationId);
    }
}

// Reset Game
function resetGame() {
    document.getElementById('gameOverlay').style.display = 'none';
    document.getElementById('pauseOverlay').style.display = 'none';
    gameRunning = true;
    gamePaused = false;
    gameStarted = true;
    init();
    gameLoop();
}

// Start Game
function startGame() {
    document.getElementById('startPrompt').style.display = 'none';
    gameRunning = true;
    gameStarted = true;
    gameLoop();
}

// Toggle Pause
function togglePause() {
    if(!gameStarted) return;
    gamePaused = !gamePaused;
    document.getElementById('pauseOverlay').style.display = gamePaused ? 'flex' : 'none';
    if(!gamePaused) gameLoop();
}

// Main Game Loop
function gameLoop() {
    if(!gameRunning && !gameStarted) return;
    
    updateGame();
    draw();
    frameCount++;
    
    animationId = requestAnimationFrame(gameLoop);
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if(e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if(!gameStarted && !gameRunning) {
            startGame();
        } else {
            jump();
        }
    }
    if(e.code === 'KeyP') {
        e.preventDefault();
        togglePause();
    }
    if(e.code === 'KeyR') {
        e.preventDefault();
        resetGame();
    }
});

canvas.addEventListener('click', () => {
    if(!gameStarted && !gameRunning) {
        startGame();
    } else if(gameRunning && !gamePaused) {
        jump();
    }
});

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if(!gameStarted && !gameRunning) {
        startGame();
    } else if(gameRunning && !gamePaused) {
        jump();
    }
});

// Remove preloader
window.addEventListener('load', () => {
    setTimeout(() => {
        const preloader = document.querySelector('.preloader');
        if(preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => preloader.remove(), 500);
        }
    }, 1000);
});

// Initialize
init();
