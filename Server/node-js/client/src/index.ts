const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const circle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    color: "red",
    speed: 4,
    text: "O"
};

const circle2 = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    color: "yellow",
    speed: 4,
    text: "O"
};

let targetX = circle.x;
let targetY = circle.y;
let offsetX = 0;
let offsetY = 0;

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
    const touch = event.touches[0];
    targetX = touch.clientX;
    targetY = touch.clientY;
}, { passive: false });

// Update and draw the game loop
function update() {
    const dx = targetX - circle.x;
    const dy = targetY - circle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 1) {
        circle.x += (dx / distance) * circle.speed;
        circle.y += (dy / distance) * circle.speed;
    }

    // Move grid based on circle movement
    offsetX -= (dx / distance) * circle.speed * 0.2;
    offsetY -= (dy / distance) * circle.speed * 0.2;

    updatePopup();
    draw();
    requestAnimationFrame(update);

    matchUpdate();
}

// Draw function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    // Draw the circle
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.fillStyle = circle.color;
    ctx.fill();
    ctx.closePath();

    // Draw the circle 2
    ctx.beginPath();
    ctx.arc(circle2.x, circle2.y, circle2.radius, 0, Math.PI * 2);
    ctx.fillStyle = circle2.color;
    ctx.fill();
    ctx.closePath();

    // Draw text inside the circle
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(circle.text, circle.x, circle.y);
}

// Draw grid function
function drawGrid() {
    const gridSize = 50;
    ctx.strokeStyle = "lightgray";
    ctx.lineWidth = 1;
    
    for (let x = (offsetX % gridSize) - gridSize; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = (offsetY % gridSize) - gridSize; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Resize canvas dynamically
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Start the game loop
update();


// Nakama connection
import {Client, Friend, Match, Session, Socket} from "@heroiclabs/nakama-js";

const NAKAMA_PUBLIC_KEY = "defaultkey";
const NAKAMA_URL = window.location.hostname;
const NAKAMA_PORT = "7350";
const NAKAMA_USE_SSL = false;

let session: Session = null;
let client: Client = null;
let socket:Socket = null;
let match:Match = null;


function generateRandomString(length: number): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


function getFromQuery(id:string): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(id);
}

class OpCodes {
    static position = 1;
    static vote = 2;
}

  
async function Connect()
{
    console.info("trying to connect to nakama");
    client = new Client(NAKAMA_PUBLIC_KEY, NAKAMA_URL, NAKAMA_PORT, NAKAMA_USE_SSL);
    
    session = await client.authenticateDevice(generateRandomString(10));
    console.info(session);

    console.info("trying to connect socket");
    var appearOnline = true;
    socket = client.createSocket();
    await socket.connect(session, appearOnline);
    console.info("☆★☆★☆★☆★☆★☆★☆★☆★☆★☆★☆★");

    socket.onmatchdata = (matchState) => {
        const receivedData = new TextDecoder().decode(matchState.data);
        try
        {
            const parsed = JSON.parse(receivedData)
            console.log(`Received op code ${matchState.op_code}: ${receivedData}`);
            circle2.x = parsed.x;
            circle2.y = parsed.y;
        }
        catch
        {
            console.log(`Received op code ${matchState.op_code}`);
        }
    };
    //let matches = await client.listMatches(session);

    const matchQuery = getFromQuery("match");
    if(matchQuery)
    {
        console.info("☆★☆★ MATCH EXISTS ★☆★☆★");
        await joinMatch(matchQuery);
        return;
    }

    await createMatch("NoImpostersAllowed");
    // Why are labels null? How do you set them? Do you need to? console.info(`★ ${match.label}`);

    //(await client.listMatches(session)).matches.forEach(m => console.info(`★ ${match.match_id}`));
}
let sendingMatchState:boolean = false;

async function sendMatchMessage(opcode:number, obj:any):Promise<void> {
    const encodedMessage = new TextEncoder().encode(JSON.stringify(obj));
    await socket.sendMatchState(match.match_id, opcode, encodedMessage);
}

async function matchUpdate():Promise<void> {
    
    if(sendingMatchState || !socket || !match)
    {
        return;
    }
    sendingMatchState = true;
    await sendMatchMessage(OpCodes.position,{ x : Math.round(circle.x), y : Math.round(circle.y)});
    sendingMatchState = false;
}

async function joinMatch(id:string):Promise<void> {
    console.info("☆★☆★ JOIN MATCH ★☆★☆★");
    match = await socket.joinMatch(id);
    console.info("★☆★☆★☆★☆★☆★☆★☆★☆★☆★☆★☆");
    console.info("☆★☆★☆★☆★☆★☆★☆★☆★☆★☆★☆★");
    console.info(`★ ★ ★ ★ ★ JOINED '${match.match_id}'`);
    
}

async function createMatch(matchName:string):Promise<void> {
    console.info("☆★☆★ CREATE MATCH ★☆★☆★");
    match = await socket.createMatch(matchName);
    console.info("★☆★☆★☆★☆★☆★☆★☆★☆★☆★☆★☆");
    console.info("☆★☆★☆★☆★☆★☆★☆★☆★☆★☆★☆★");
    console.info(`★ ★ ★ ★ ★ CREATED '${match.match_id}'`);
}

Connect();

// Update popup position display
function updatePopup() {
    const popup = document.getElementById("popupPosition");
    if (popup) {
        popup.innerText = `Position: (${Math.round(circle.x)}, ${Math.round(circle.y)})`;
    }

    const popupInfo = document.getElementById("popupInfo");
    if (popupInfo) {
        if(session)
        {
            popupInfo.innerText = `User\n Id:${session.user_id}\UserName:${session.username}\n`;
        }
        else
        {
            popupInfo.innerText = `No Session found.`;
        }
    }
    /*
    const popupInfo = document.getElementById("popupInfo");
    if (popupInfo) {
        if(session)
        {
            popupInfo.innerText = `User\n Id:${session.user_id}\UserName:${session.username}\n`;
        }
        else
        {
            popupInfo.innerText = `No Session found.`;
        }
    }
    */
}

// Close button
const popupCloseButton = document.getElementById("popupCloseButton");
if (popupCloseButton) {
    popupCloseButton.addEventListener("click", closePopup);
}
function closePopup() {
    document.getElementById("popup").style.display = "none";
}

// Create match button
const createMatchButton = document.getElementById("createMatchButton");
if (popupCloseButton) {
    popupCloseButton.addEventListener("click", ()=> createMatch("new"));
}
