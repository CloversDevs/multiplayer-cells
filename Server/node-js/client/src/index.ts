import { myNakama } from "./myNakama";
import { MatchController } from "./myMatch";
import { MyMatchRenderer } from "./myMatchRenderer";

// Setup canvas to display the match on.
const canvasId:string = "gameCanvas"; 
const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Prevent touch scrolling and pinch zooming
document.addEventListener("touchmove", (event) => {
    event.preventDefault();
}, { passive: false });

document.addEventListener("gesturestart", (event) => {
    event.preventDefault();
});

// Track mouse movement
window.addEventListener("mousemove", (event) => {
    if(!matchController) return;
    matchController.OnPlayerClick(event.clientX, event.clientY);
});

// Track touch movement (mobile support)
canvas.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];
    matchController.OnPlayerClick(touch.clientX, touch.clientY);
}, { passive: false });

// Update and draw the game loop
function update() {
    if(matchController)
    {
        matchController.Update();
        matchRenderer.Draw(matchController);
    }
    
    updatePopup();
    
    requestAnimationFrame(update);
    
    if(matchController)
    {
        matchController.SendState();
    }
}


// Resize canvas dynamically
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Start the game loop
update();

// Update popup position display
function updatePopup() {
    const popup = document.getElementById("popupPosition");
    if (popup) {
        if(matchController)
        {
            let player = matchController.LocalPlayer;
            popup.innerText = `Position: (${Math.round(player.x)}, ${Math.round(player.y)})`;
        }
    }

    const popupInfo = document.getElementById("popupInfo");
    if (popupInfo) {
        if(nk && nk.session)
        {
            popupInfo.innerText = `User\n Id:${nk.session.user_id}\UserName:${nk.session.username}\n`;
        }
        else
        {
            popupInfo.innerText = `No Session found.`;
        }
    }
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
    popupCloseButton.addEventListener("click", ()=> nk.createMatch("new"));
}

// Create set name button
//const usernamePopup = document.getElementById("usernamePopup") as HTMLElement;
const usernameInput = document.getElementById("usernameInput") as HTMLInputElement;
const setUsernameButton = document.getElementById("setUsernameButton") as HTMLElement;

if (usernameInput && setUsernameButton) {
    setUsernameButton.addEventListener("click", () => {
        const username = usernameInput.value.trim();
        if (username) {
            nk.setDisplayName(username);
        }
    });

    usernameInput.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;

        const username = usernameInput.value.trim();
        if (username) {
            nk.setDisplayName(username);
        }
    });
}


let nk:myNakama = null;
let matchController:MatchController = null;
const matchRenderer:MyMatchRenderer = new MyMatchRenderer(canvasId);

async function Start():Promise<void> {
    
    const NAKAMA_PUBLIC_KEY = "defaultkey";
    const NAKAMA_URL = window.location.hostname;
    const NAKAMA_PORT = "7350";
    const NAKAMA_USE_SSL = false;

    nk = new myNakama();
    await nk.connect(NAKAMA_URL, NAKAMA_PUBLIC_KEY, NAKAMA_PORT, NAKAMA_USE_SSL);
    await nk.setDisplayName("anonymous");
    await nk.createMatch("TestMatch");
    matchController = new MatchController(nk);
    matchController.StartMatch();
    nk.onAccountUpdated.addListener(()=> {
        console.log("local update");
        matchController.LocalPlayer.RefreshUser(nk)}
    );
}

window.addEventListener("unload", () => {
    console.log("Performing cleanup on tab close...");
    nk.socket.disconnect(true);
});

Start();

