const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const circle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    color: "red",
    speed: 4
};

let targetX = circle.x;
let targetY = circle.y;

// Prevent touch scrolling and pinch zooming
document.addEventListener("touchmove", (event) => {
    event.preventDefault();
}, { passive: false });

document.addEventListener("gesturestart", (event) => {
    event.preventDefault();
});

// Track mouse movement
window.addEventListener("mousemove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
});

// Track touch movement (mobile support)
canvas.addEventListener("touchmove", (event) => {
    const touch = event.touches[0]; // Get first touch
    targetX = touch.clientX;
    targetY = touch.clientY;
}, { passive: false });

// Update and draw the game loop
function update() {
    // Calculate distance
    const dx = targetX - circle.x;
    const dy = targetY - circle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Move towards the mouse
    if (distance > 1) {
        circle.x += (dx / distance) * circle.speed;
        circle.y += (dy / distance) * circle.speed;
    }

    draw();
    requestAnimationFrame(update);
}

// Draw function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the circle
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.fillStyle = circle.color;
    ctx.fill();
    ctx.closePath();
}

// Start the game loop
update();

// Resize canvas dynamically
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
