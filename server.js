const WebSocket = require('ws');
const screenshot = require('screenshot-desktop');
const robot = require('robotjs');

// Set up WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    // Start sending screen captures
    const sendScreen = async () => {
        try {
            while (ws.readyState === WebSocket.OPEN) {
                // Capture the screen
                const img = await screenshot({ format: 'jpg' });
                const base64Image = img.toString('base64');
                ws.send(`IMAGE:${base64Image}`);
                await new Promise(resolve => setTimeout(resolve, 100)); // 10 FPS
            }
        } catch (err) {
            console.error('Error capturing screen:', err);
        }
    };
    sendScreen();

    // Handle messages from the client (mouse/keyboard inputs)
    ws.on('message', (message) => {
        const msg = message.toString();
        if (msg.startsWith('MOUSE_MOVE:')) {
            const [x, y] = msg.split(':')[1].split(',').map(Number);
            robot.moveMouse(x, y);
        } else if (msg === 'MOUSE_CLICK:') {
            robot.mouseClick();
        } else if (msg.startsWith('KEY_PRESS:')) {
            const keyCode = msg.split(':')[1];
            robot.keyTap(keyCode.toLowerCase());
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('Server running on ws://localhost:8080');