class StarField {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        document.body.prepend(this.canvas);

        this.gl = this.canvas.getContext('webgl');
        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }

        // Initialize shaders
        const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vertexShader, `
            attribute vec3 position;
            attribute vec3 color;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            varying float vDistance;
            varying vec3 vColor;
            
            void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                gl_PointSize = 3.0 * (1000.0 / length(mvPosition.xyz));
                vDistance = 1.0 - (length(mvPosition.xyz) / 1000.0);
                vColor = color;
            }
        `);
        this.gl.compileShader(vertexShader);

        const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fragmentShader, `
            precision mediump float;
            varying float vDistance;
            varying vec3 vColor;
            
            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                if (dist > 0.5) discard;
                float alpha = smoothstep(0.5, 0.0, dist) * vDistance;
                gl_FragColor = vec4(vColor, alpha);
            }
        `);
        this.gl.compileShader(fragmentShader);

        // Create shader program
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        this.gl.useProgram(this.program);

        // Create star positions and colors
        const numStars = 8000;
        this.stars = new Float32Array(numStars * 3);
        this.colors = new Float32Array(numStars * 3);
        
        for (let i = 0; i < numStars; i++) {
            const i3 = i * 3;
            this.stars[i3] = (Math.random() - 0.5) * 2000;
            this.stars[i3 + 1] = (Math.random() - 0.5) * 2000;
            this.stars[i3 + 2] = (Math.random() - 0.5) * 2000;

            // Generate random star colors (mostly white/blue with some red and yellow)
            const colorChoice = Math.random();
            if (colorChoice < 0.7) {
                // White/blue stars
                const blueIntensity = 0.8 + Math.random() * 0.2;
                this.colors[i3] = 0.8 + Math.random() * 0.2;
                this.colors[i3 + 1] = 0.8 + Math.random() * 0.2;
                this.colors[i3 + 2] = blueIntensity;
            } else if (colorChoice < 0.85) {
                // Yellow stars
                this.colors[i3] = 1.0;
                this.colors[i3 + 1] = 0.8 + Math.random() * 0.2;
                this.colors[i3 + 2] = 0.3;
            } else {
                // Red stars
                this.colors[i3] = 1.0;
                this.colors[i3 + 1] = 0.3;
                this.colors[i3 + 2] = 0.3;
            }
        }

        // Create buffers
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.stars, this.gl.STATIC_DRAW);

        const colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.colors, this.gl.STATIC_DRAW);

        // Set up attributes and uniforms
        const positionLocation = this.gl.getAttribLocation(this.program, 'position');
        const colorLocation = this.gl.getAttribLocation(this.program, 'color');

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.enableVertexAttribArray(colorLocation);
        this.gl.vertexAttribPointer(colorLocation, 3, this.gl.FLOAT, false, 0, 0);

        this.modelViewMatrixLocation = this.gl.getUniformLocation(this.program, 'modelViewMatrix');
        this.projectionMatrixLocation = this.gl.getUniformLocation(this.program, 'projectionMatrix');

        // Initialize matrices
        this.modelViewMatrix = new Float32Array(16);
        this.projectionMatrix = new Float32Array(16);

        // Create ship cursor with unique ID
        const shipId = 'space-ship-cursor';
        // Remove any existing ship cursor
        const existingShip = document.getElementById(shipId);
        if (existingShip) {
            existingShip.remove();
        }

        this.shipCursor = document.createElement('div');
        this.shipCursor.id = shipId;
        this.shipCursor.style.position = 'fixed';
        this.shipCursor.style.pointerEvents = 'none';
        this.shipCursor.style.width = '40px';  // Smaller size
        this.shipCursor.style.height = '40px'; // Smaller size
        this.shipCursor.style.zIndex = '9999';
        this.shipCursor.style.transform = 'translate(-50%, -50%)';
        this.shipCursor.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 40 40" style="position: absolute; top: 0; left: 0;">
                <defs>
                    <filter id="ship-glow">
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <linearGradient id="shipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#4287f5"/>
                        <stop offset="100%" style="stop-color:#2b4d91"/>
                    </linearGradient>
                </defs>
                <!-- Thruster animation -->
                <g class="thruster">
                    <path d="M20 28 L23 35 L20 33 L17 35 Z" fill="#ff6600">
                        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.2s" repeatCount="indefinite"/>
                        <animate attributeName="d" 
                            values="M20 28 L23 35 L20 33 L17 35 Z;M20 28 L24 37 L20 34 L16 37 Z;M20 28 L23 35 L20 33 L17 35 Z" 
                            dur="0.2s" 
                            repeatCount="indefinite"/>
                    </path>
                </g>
                <!-- Ship body -->
                <path d="M20 8 L28 32 L20 27 L12 32 Z" 
                    fill="url(#shipGradient)" 
                    stroke="#4287f5" 
                    stroke-width="1.5" 
                    filter="url(#ship-glow)">
                    <animate attributeName="stroke-opacity" 
                        values="1;0.5;1" 
                        dur="1.5s" 
                        repeatCount="indefinite"/>
                </path>
            </svg>
        `;
        document.body.appendChild(this.shipCursor);
        document.body.style.cursor = 'none';

        // Set initial position to center of screen
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        this.shipCursor.style.left = `${centerX}px`;
        this.shipCursor.style.top = `${centerY}px`;

        // Set up mouse tracking with improved smooth rotation
        this.mouseX = 0;
        this.mouseY = 0;
        this.currentRotation = 0;
        this.targetRotation = 0;
        this.velocity = { x: 0, y: 0 };
        this.lastMousePos = { x: centerX, y: centerY };
        
        document.addEventListener('mousemove', (e) => {
            // Calculate velocity
            this.velocity.x = e.clientX - this.lastMousePos.x;
            this.velocity.y = e.clientY - this.lastMousePos.y;
            this.lastMousePos = { x: e.clientX, y: e.clientY };

            // Update starfield movement
            this.mouseX = (e.clientX - window.innerWidth / 2) * 0.1;
            this.mouseY = (e.clientY - window.innerHeight / 2) * 0.1;
            
            // Update ship position
            this.shipCursor.style.left = `${e.clientX}px`;
            this.shipCursor.style.top = `${e.clientY}px`;
            
            // Calculate rotation based on velocity instead of movement
            if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
                this.targetRotation = Math.atan2(this.velocity.y, this.velocity.x) * (180 / Math.PI) + 90;
            }
            
            // Smoother rotation with easing
            const rotationDiff = ((this.targetRotation - this.currentRotation + 540) % 360) - 180;
            this.currentRotation += rotationDiff * 0.15;
            
            // Apply transforms
            this.shipCursor.style.transform = `translate(-50%, -50%) rotate(${this.currentRotation}deg)`;
        });

        // Add debug logging
        console.log('Ship cursor created:', this.shipCursor);
        console.log('Ship cursor visible:', this.shipCursor.style.display !== 'none');
        console.log('Ship cursor dimensions:', {
            width: this.shipCursor.style.width,
            height: this.shipCursor.style.height,
            zIndex: this.shipCursor.style.zIndex
        });

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.isRunning = true;
        this.animate();
    }

    resize() {
        const realToCSSPixels = window.devicePixelRatio;
        const displayWidth = Math.floor(this.canvas.clientWidth * realToCSSPixels);
        const displayHeight = Math.floor(this.canvas.clientHeight * realToCSSPixels);

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            this.gl.viewport(0, 0, displayWidth, displayHeight);

            // Update projection matrix
            const aspect = displayWidth / displayHeight;
            const fov = Math.PI / 4;
            const near = 1;
            const far = 2000;

            const f = 1.0 / Math.tan(fov / 2);
            this.projectionMatrix[0] = f / aspect;
            this.projectionMatrix[1] = 0;
            this.projectionMatrix[2] = 0;
            this.projectionMatrix[3] = 0;
            this.projectionMatrix[4] = 0;
            this.projectionMatrix[5] = f;
            this.projectionMatrix[6] = 0;
            this.projectionMatrix[7] = 0;
            this.projectionMatrix[8] = 0;
            this.projectionMatrix[9] = 0;
            this.projectionMatrix[10] = (far + near) / (near - far);
            this.projectionMatrix[11] = -1;
            this.projectionMatrix[12] = 0;
            this.projectionMatrix[13] = 0;
            this.projectionMatrix[14] = (2 * far * near) / (near - far);
            this.projectionMatrix[15] = 0;
        }
    }

    stopAnimation() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;
        
        const time = Date.now() * 0.00005;

        // Update model view matrix
        const s = Math.sin(time);
        const c = Math.cos(time);
        
        this.modelViewMatrix[0] = c;
        this.modelViewMatrix[1] = 0;
        this.modelViewMatrix[2] = s;
        this.modelViewMatrix[3] = 0;
        this.modelViewMatrix[4] = 0;
        this.modelViewMatrix[5] = 1;
        this.modelViewMatrix[6] = 0;
        this.modelViewMatrix[7] = 0;
        this.modelViewMatrix[8] = -s;
        this.modelViewMatrix[9] = 0;
        this.modelViewMatrix[10] = c;
        this.modelViewMatrix[11] = 0;
        this.modelViewMatrix[12] = this.mouseX;
        this.modelViewMatrix[13] = -this.mouseY;
        this.modelViewMatrix[14] = -1000;
        this.modelViewMatrix[15] = 1;

        // Clear with a very dark blue background
        this.gl.clearColor(0.0, 0.0, 0.05, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        this.gl.uniformMatrix4fv(this.projectionMatrixLocation, false, this.projectionMatrix);
        this.gl.uniformMatrix4fv(this.modelViewMatrixLocation, false, this.modelViewMatrix);
        
        this.gl.drawArrays(this.gl.POINTS, 0, this.stars.length / 3);

        if (this.isRunning) {
            requestAnimationFrame(() => this.animate());
        }
    }
}

// Remove the auto-initialization and export the class
window.StarField = StarField; // Make it globally available for the background manager 