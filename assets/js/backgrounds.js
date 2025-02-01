// Make StarField available globally
window.StarField = StarField;

class BackgroundManager {
    constructor() {
        console.log('Initializing BackgroundManager...');
        
        // List of available background effects
        this.effects = [
            StarField,           // Index 0: Stars
            DNAHelix,           // Index 1: DNA
            WavePattern         // Index 2: Waves
        ];
        
        this.currentEffect = null;
        this.currentIndex = -1;
        this.backgroundContainer = null;
        
        // Create a container for backgrounds
        this.createBackgroundContainer();
        
        console.log('Available effects:', this.effects.map(e => e.name));
        
        // Start with Stars (index 0)
        setTimeout(() => {
            this.switchBackground(0);
        }, 100);

        // Add rocket cursor
        this.addRocketCursor();
    }

    createBackgroundContainer() {
        // Remove any existing container
        const existingContainer = document.getElementById('background-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Create new container
        this.backgroundContainer = document.createElement('div');
        this.backgroundContainer.id = 'background-container';
        this.backgroundContainer.style.position = 'fixed';
        this.backgroundContainer.style.top = '0';
        this.backgroundContainer.style.left = '0';
        this.backgroundContainer.style.width = '100%';
        this.backgroundContainer.style.height = '100%';
        this.backgroundContainer.style.zIndex = '-1';
        this.backgroundContainer.style.overflow = 'hidden';
        document.body.prepend(this.backgroundContainer);
    }

    addRocketCursor() {
        const ship = document.createElement('div');
        ship.id = 'space-ship-cursor';
        ship.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: url('./assets/png/rocket.png') no-repeat center center;
            background-size: contain;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(ship);

        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            ship.style.left = mouseX + 'px';
            ship.style.top = mouseY + 'px';
            
            // Calculate angle based on mouse movement
            if (this.lastX && this.lastY) {
                const dx = mouseX - this.lastX;
                const dy = mouseY - this.lastY;
                if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    ship.style.transform = `rotate(${angle}deg)`;
                }
            }
            
            this.lastX = mouseX;
            this.lastY = mouseY;
        });
    }

    switchBackground(index) {
        console.log(`Switching to background ${index}`);
        
        // Don't switch if it's the same background
        if (index === this.currentIndex) {
            console.log('Already on this background');
            return;
        }

        // Clear existing canvas if any
        if (this.currentEffect) {
            console.log('Cleaning up current effect');
            if (this.currentEffect.canvas) {
                this.currentEffect.canvas.remove();
            }
            if (this.currentEffect.stopAnimation) {
                this.currentEffect.stopAnimation();
            }
            this.currentEffect = null;
        }

        // Clear the background container
        while (this.backgroundContainer.firstChild) {
            this.backgroundContainer.removeChild(this.backgroundContainer.firstChild);
        }
        
        try {
            // Create new effect
            const SelectedEffect = this.effects[index];
            if (!SelectedEffect) {
                console.error(`No effect found at index ${index}`);
                return;
            }
            
            console.log(`Creating new instance of ${SelectedEffect.name}`);
            this.currentEffect = new SelectedEffect();
            
            // Move the canvas into our container if it exists
            if (this.currentEffect.canvas) {
                if (this.currentEffect.canvas.parentNode !== this.backgroundContainer) {
                    this.backgroundContainer.appendChild(this.currentEffect.canvas);
                }
            }
            
            this.currentIndex = index;
        } catch (error) {
            console.error('Error creating effect:', error);
        }
    }
}

// Make BackgroundManager available globally
window.BackgroundManager = BackgroundManager;

class DNAHelix {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        
        this.ctx = this.canvas.getContext('2d');
        this.time = 0;
        this.strands = [];
        this.mouseX = 0;
        this.mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.isRunning = true;
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.strands = [];
        
        // Create fewer, more spaced out strands
        for (let i = 0; i < this.canvas.width; i += 300) {
            this.strands.push({
                x: i,
                y: Math.random() * this.canvas.height,
                speed: 0.2 + Math.random() * 0.2, // Slower movement
                offset: Math.random() * Math.PI * 2
            });
        }
    }

    stopAnimation() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;
        this.time += 0.01;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.strands.forEach(strand => {
            strand.y += strand.speed;
            if (strand.y > this.canvas.height + 100) {
                strand.y = -100;
            }

            // Mouse interaction
            const dx = this.mouseX - strand.x;
            const dy = this.mouseY - strand.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const influence = Math.max(0, 1 - dist / 300);

            // Draw DNA helix with mouse influence
            const amplitude = 30 + influence * 20;
            const frequency = 0.02;
            const spacing = 25; // More spaced out
            
            for (let i = -100; i < 200; i += spacing) {
                const y = strand.y + i;
                
                // Calculate base positions with mouse influence
                const x1 = strand.x + Math.sin(y * frequency + this.time + strand.offset) * amplitude;
                const x2 = strand.x + Math.sin(y * frequency + this.time + strand.offset + Math.PI) * amplitude;

                // Draw connecting lines with reduced opacity
                if (i % (spacing * 2) === 0) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.2)';
                    this.ctx.moveTo(x1, y);
                    this.ctx.lineTo(x2, y);
                    this.ctx.stroke();
                }

                // Draw base pairs with subtle colors
                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(100, 200, 255, 0.4)';
                this.ctx.arc(x1, y, 2, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(200, 220, 255, 0.4)';
                this.ctx.arc(x2, y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        if (this.isRunning) {
            requestAnimationFrame(() => this.animate());
        }
    }
}

class WavePattern {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        
        this.ctx = this.canvas.getContext('2d');
        this.time = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.isRunning = true;
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    stopAnimation() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;
        this.time += 0.005; // Slower animation
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Create a subtle blue gradient
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient.addColorStop(0, 'rgba(100, 200, 255, 0.2)');
        gradient.addColorStop(0.5, 'rgba(150, 220, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(100, 200, 255, 0.2)');

        // Draw fewer, smoother waves
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 1;

            for (let x = 0; x < this.canvas.width; x += 5) {
                const distFromMouse = Math.hypot(x - this.mouseX, 0);
                const influence = Math.max(0, 1 - distFromMouse / 300);
                
                const y = Math.sin(x * 0.003 + this.time + i) * 30 + 
                         Math.sin(x * 0.007 + this.time * 0.5) * 15 +
                         this.canvas.height / 2 +
                         influence * 30 * Math.sin(this.time);

                if (x === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.stroke();
        }

        if (this.isRunning) {
            requestAnimationFrame(() => this.animate());
        }
    }
}

class CircuitBoard {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        document.body.prepend(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.time = 0;
        this.paths = [];
        this.nodes = [];
        this.pulses = [];
        this.mouseX = 0;
        this.mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.addPulse(e.clientX, e.clientY);
        });
        
        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.isRunning = true;
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.generateCircuit();
    }

    generateCircuit() {
        this.nodes = [];
        this.paths = [];
        const gridSize = 50;
        
        // Create nodes
        for (let x = gridSize; x < this.canvas.width; x += gridSize) {
            for (let y = gridSize; y < this.canvas.height; y += gridSize) {
                if (Math.random() < 0.3) {
                    this.nodes.push({
                        x: x + (Math.random() * 20 - 10),
                        y: y + (Math.random() * 20 - 10),
                        size: Math.random() * 3 + 2
                    });
                }
            }
        }

        // Create paths between nodes
        this.nodes.forEach((node, i) => {
            const nearestNodes = this.findNearestNodes(node, 3);
            nearestNodes.forEach(nearNode => {
                if (Math.random() < 0.7) {
                    this.paths.push({
                        start: node,
                        end: nearNode,
                        width: Math.random() * 1.5 + 0.5
                    });
                }
            });
        });
    }

    findNearestNodes(node, count) {
        return this.nodes
            .filter(n => n !== node)
            .sort((a, b) => {
                const distA = Math.hypot(a.x - node.x, a.y - node.y);
                const distB = Math.hypot(b.x - node.x, b.y - node.y);
                return distA - distB;
            })
            .slice(0, count);
    }

    addPulse(x, y) {
        const nearestNode = this.nodes.reduce((nearest, node) => {
            const dist = Math.hypot(node.x - x, node.y - y);
            return dist < Math.hypot(nearest.x - x, nearest.y - y) ? node : nearest;
        }, this.nodes[0]);

        if (Math.hypot(nearestNode.x - x, nearestNode.y - y) < 100) {
            this.pulses.push({
                node: nearestNode,
                progress: 0,
                speed: 0.02 + Math.random() * 0.02
            });
        }
    }

    stopAnimation() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;
        this.time += 0.016;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw paths
        this.paths.forEach(path => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(0, 255, 150, 0.3)';
            this.ctx.lineWidth = path.width;
            this.ctx.moveTo(path.start.x, path.start.y);
            this.ctx.lineTo(path.end.x, path.end.y);
            this.ctx.stroke();
        });

        // Draw nodes
        this.nodes.forEach(node => {
            this.ctx.beginPath();
            this.ctx.fillStyle = 'rgba(0, 255, 150, 0.8)';
            this.ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Update and draw pulses
        this.pulses = this.pulses.filter(pulse => {
            pulse.progress += pulse.speed;
            
            const connectedPaths = this.paths.filter(path => 
                path.start === pulse.node || path.end === pulse.node
            );

            connectedPaths.forEach(path => {
                const start = path.start === pulse.node ? path.start : path.end;
                const end = path.start === pulse.node ? path.end : path.start;
                
                const x = start.x + (end.x - start.x) * pulse.progress;
                const y = start.y + (end.y - start.y) * pulse.progress;
                
                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(0, 255, 150, 0.8)';
                this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                this.ctx.fill();
            });

            return pulse.progress < 1;
        });

        if (this.isRunning) {
            requestAnimationFrame(() => this.animate());
        }
    }
}

class AuroraEffect {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        document.body.prepend(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.time = 0;
        this.curves = [];
        this.mouseX = 0;
        this.mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.isRunning = true;
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.curves = [];
        
        for (let i = 0; i < 5; i++) {
            this.curves.push({
                points: [],
                color: `hsl(${180 + i * 30}, 100%, 50%)`,
                offset: i * 0.5
            });
            
            for (let x = 0; x <= this.canvas.width; x += 50) {
                this.curves[i].points.push({
                    x,
                    y: this.canvas.height * 0.5,
                    vy: 0
                });
            }
        }
    }

    stopAnimation() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;
        
        this.time += 0.005;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.curves.forEach((curve, curveIndex) => {
            this.ctx.beginPath();
            this.ctx.strokeStyle = curve.color.replace('100%', '70%');
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = curve.color.replace('100%', '50%');

            curve.points.forEach((point, i) => {
                const noise = Math.sin(this.time + i * 0.2 + curve.offset) * 50;
                const mouseInfluence = Math.sin(
                    (this.mouseX - point.x) * 0.005 + 
                    (this.mouseY - point.y) * 0.005
                ) * 30;
                
                point.y = this.canvas.height * 0.5 + noise + mouseInfluence;

                if (i === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    const xc = (point.x + curve.points[i - 1].x) * 0.5;
                    const yc = (point.y + curve.points[i - 1].y) * 0.5;
                    this.ctx.quadraticCurveTo(curve.points[i - 1].x, curve.points[i - 1].y, xc, yc);
                }
            });

            this.ctx.stroke();
        });

        if (this.isRunning) {
            requestAnimationFrame(() => this.animate());
        }
    }
}

class FirefliesEffect {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        document.body.prepend(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.fireflies = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.time = 0;
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.isRunning = true;
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.fireflies = [];
        
        for (let i = 0; i < 50; i++) {
            this.fireflies.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 1 + 0.5,
                angle: Math.random() * Math.PI * 2,
                angleSpeed: (Math.random() - 0.5) * 0.05,
                hue: Math.random() * 60 + 40,
                pulse: Math.random() * Math.PI * 2
            });
        }
    }

    stopAnimation() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;
        
        this.time += 0.01;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.fireflies.forEach(fly => {
            // Update position
            fly.angle += fly.angleSpeed;
            fly.x += Math.cos(fly.angle) * fly.speed;
            fly.y += Math.sin(fly.angle) * fly.speed;
            fly.pulse += 0.1;

            // Wrap around screen
            if (fly.x < 0) fly.x = this.canvas.width;
            if (fly.x > this.canvas.width) fly.x = 0;
            if (fly.y < 0) fly.y = this.canvas.height;
            if (fly.y > this.canvas.height) fly.y = 0;

            // Mouse interaction
            const dx = this.mouseX - fly.x;
            const dy = this.mouseY - fly.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                fly.angle = Math.atan2(dy, dx) + Math.PI;
            }

            // Draw firefly
            const glow = (Math.sin(fly.pulse) * 0.3 + 0.3);
            this.ctx.beginPath();
            this.ctx.fillStyle = `hsla(${fly.hue}, 70%, 60%, ${glow})`;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = `hsla(${fly.hue}, 70%, 60%, ${glow * 0.5})`;
            this.ctx.arc(fly.x, fly.y, fly.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        if (this.isRunning) {
            requestAnimationFrame(() => this.animate());
        }
    }
}

class NeonGridEffect {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        document.body.prepend(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.time = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.isRunning = true;
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    stopAnimation() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;
        
        this.time += 0.005;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const gridSize = 70;
        const perspective = 800;
        const cameraZ = -10 + Math.sin(this.time * 0.3) * 3;

        // Draw horizontal lines
        for (let z = 20; z >= 0; z--) {
            const depth = (z * gridSize - cameraZ) % (gridSize * 20);
            const y = this.canvas.height / 2 + depth * 0.5;
            const alpha = Math.max(0, 0.5 - depth / (gridSize * 20));
            const thickness = Math.max(1, 2 * (1 - depth / (gridSize * 20)));
            
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * 0.7})`;
            this.ctx.lineWidth = thickness;
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = 'rgba(0, 255, 255, 0.3)';
            
            this.ctx.moveTo(0, y);
            for (let x = 0; x < this.canvas.width; x += 10) {
                const wave = Math.sin(x * 0.01 + this.time + z) * 20;
                const mouseWave = Math.sin((x - this.mouseX) * 0.01) * 
                                Math.sin((y - this.mouseY) * 0.01) * 50;
                this.ctx.lineTo(x, y + wave + mouseWave);
            }
            this.ctx.stroke();
        }

        // Draw vertical lines with reduced intensity
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            const alpha = 0.2 + Math.sin(x * 0.01 + this.time) * 0.1;
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(255, 0, 255, ${alpha * 0.7})`;
            this.ctx.lineWidth = 1;
            this.ctx.shadowBlur = 3;
            this.ctx.shadowColor = 'rgba(255, 0, 255, 0.3)';
            
            this.ctx.moveTo(x, 0);
            for (let y = 0; y < this.canvas.height; y += 10) {
                const wave = Math.sin(y * 0.01 + this.time) * 10;
                const mouseWave = Math.sin((x - this.mouseX) * 0.01) * 
                                Math.sin((y - this.mouseY) * 0.01) * 30;
                this.ctx.lineTo(x + wave + mouseWave, y);
            }
            this.ctx.stroke();
        }

        if (this.isRunning) {
            requestAnimationFrame(() => this.animate());
        }
    }
} 