import { myNakama } from "./myNakama";
import { MatchController } from "./myMatch";
import { MyMatchRenderer } from "./myMatchRenderer";
import { ScreenManager } from "./ScreenManager";
import { NAKAMA_SOCKET_SERVER_KEY } from "./publicKeys";

const USER_COLOR_STORAGE_KEY = "userColor";

////////////////
// UI Binding //
////////////////

const screenManager = new ScreenManager();
screenManager.addScreen('gameScreen');
screenManager.addScreen('profileScreen');
screenManager.addScreen('colorPickerScreen');
screenManager.addScreen('ticTacToeScreen');

// Open Screen buttons
document.getElementById('characterSelectionButton')?.addEventListener('click', () => screenManager.showScreen('profileScreen'));
document.getElementById('colorPickerSelectionButton')?.addEventListener('click', () => screenManager.showScreen('colorPickerScreen'));
document.getElementById('closeProfileScreenButton')?.addEventListener('click', () =>  screenManager.showScreen('gameScreen'));
document.getElementById('closeColorPickerScreenButton')?.addEventListener('click', () => screenManager.showScreen('gameScreen'));
document.getElementById('closeColorPickerScreenButton')?.addEventListener('click', () => screenManager.showScreen('gameScreen'));
document.getElementById('closeTicTacToeButton')?.addEventListener('click', () => screenManager.showScreen('gameScreen'));

const colorPicker = document.getElementById("colorPicker") as HTMLInputElement;
const colorBox = document.getElementById("colorBox") as HTMLElement;

if (colorPicker && colorBox) {
    colorPicker.addEventListener("input", () => {
        const selectedColor = colorPicker.value;
        colorBox.style.backgroundColor = selectedColor;
        console.log("Selected color:", selectedColor);
        localStorage.setItem(USER_COLOR_STORAGE_KEY, selectedColor);
    });
}

const getOrCreateUserColor = ():string=> {
    let userColor = localStorage.getItem(USER_COLOR_STORAGE_KEY);
    if (!userColor) {
        userColor = "blue";
        console.info(`[BOOT] Generate new color: '${userColor}'`);
        localStorage.setItem(USER_COLOR_STORAGE_KEY, userColor);
        return userColor;
    }
    return userColor;
}

// Close button
document.getElementById("popupCloseButton")?.addEventListener("click", closePopup);
document.getElementById("createMatchButton")?.addEventListener("click", ()=> nk.createMatch("new"));
document.getElementById("rpcTestButton")?.addEventListener("click", rpcTest);
document.getElementById("rpcFindMatch")?.addEventListener("click", rpcFindMatch);

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

// Get elements
const topBar = document.getElementById("top-bar") as HTMLElement;
const settingsButton = document.getElementById("settingsButton") as HTMLElement;
const settingsPanel = document.getElementById("settingsPanel") as HTMLElement;
const username = document.getElementById("username") as HTMLElement;
const logoutButton = document.getElementById("logoutButton") as HTMLElement;

// Event listeners
settingsButton.addEventListener("click", toggleSettings);
username.addEventListener("click", editUsername);
logoutButton.addEventListener("click", logout);


//////////////////
// Setup canvas //
//////////////////

const canvasId:string = "gameCanvas"; 
const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
if(!canvas) 
{
    console.error("no canvas");
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Resize canvas dynamically
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});


// Prevent touch scrolling and pinch zooming
document.addEventListener("touchmove", (event) => {
    event.preventDefault();
}, { passive: false });

document.addEventListener("gesturestart", (event) => {
    event.preventDefault();
});

//////////////////////

document.addEventListener("DOMContentLoaded", () => {
    const profileScreen = document.getElementById("profileScreen");
    if (!profileScreen) return;

    const portraitImg = profileScreen.querySelector("#portrait-img") as HTMLImageElement;
    const charButtons = profileScreen.querySelectorAll<HTMLButtonElement>(".character-grid .char-btn");
    const powerElements = profileScreen.querySelectorAll<HTMLDivElement>(".powers .power");

    charButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            const imgSrc = button.getAttribute("data-img");
            if (imgSrc && portraitImg) {
                portraitImg.src = imgSrc;
                console.log(`Button ${index} clicked. Image set to: ${imgSrc}`);
            }
            setPowerText(index,`${index}`)
        });
    });

    const setCharacterImage = (index: number, imgSrc: string) => {
        if (index >= 0 && index < charButtons.length) {
            charButtons[index].setAttribute("data-img", imgSrc);
            console.log(`Character button ${index} image set to ${imgSrc}`);
        }
    };

    const setPowerText = (index: number, text: string) => {
      if (index < 0 || index >= powerElements.length) {
      	console.error(`Can't set power text out of index ${index} in length ${powerElements.length}`);
        return;
      }
      powerElements[index].textContent = text;
      console.log(`Power ${index} text set to ${text}`);
    };

    const closeProfileButton = profileScreen.querySelector("#closeProfileScreenButton");
    closeProfileButton?.addEventListener("click", () => {
        profileScreen.classList.add("hidden");
        console.log("Profile screen closed.");
    });
});

// Track mouse movement
window.addEventListener("mousemove", (event) => {
    if(!matchController || topBar.contains(event.target as Element) || settingsPanel.contains(event.target as Element)) return;
    matchController.OnPlayerClick(event.clientX, event.clientY);
});

// Track touch movement (mobile support)
canvas.addEventListener("touchmove", (event) => {
    if(!matchController || topBar.contains(event.target as Element) || settingsPanel.contains(event.target as Element)) return;
    const touch = event.touches[0];
    matchController.OnPlayerClick(touch.clientX, touch.clientY);
}, { passive: false });

let lastNetworkUpdate = 0;
const networkUpdateRate = 1000 / 20; // 20 updates per second

// Update and draw the game loop
function update(currentTime: number) {
    if(matchController)
    {
        matchController.LocalPlayer.color = getOrCreateUserColor();
        matchController.Update();
        matchRenderer.Draw(matchController);
    }
    
    updatePopup();
    
    requestAnimationFrame(update);
    
    if(matchController)
    {
        const deltaTime = currentTime - lastNetworkUpdate;
        if (deltaTime >= networkUpdateRate) {
            matchController.SendState();
            lastNetworkUpdate = currentTime;
        }
    }
}


async function rpcTest():Promise<void> {
    const response = await nk.rpcHealthCheck();
    alert(JSON.stringify(response));
}

async function rpcFindMatch():Promise<void> {
    const response = await nk.rpcHealthCheck();
    nk.joinMatch(response.id);
    alert(JSON.stringify(response));
}

// Start the game loop
requestAnimationFrame(update);

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

// Toggle settings panel visibility
function toggleSettings(): void {
    settingsPanel.classList.toggle("active");
}

// Enable inline username editing
function editUsername(): void {
    const currentText: string = username.textContent || "";

    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.className = "username-input";

    // Submit on enter
    input.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;

        username.textContent = input.value;
        nk.setDisplayName(input.value);
        username.addEventListener("click", editUsername);
    });

    // Submit on close
    input.addEventListener("blur", () => {
        username.textContent = input.value;
        nk.setDisplayName(input.value);
        username.addEventListener("click", editUsername);
    });

    username.textContent = "";
    username.appendChild(input);
    input.focus();
}

// Log out function
function logout(): void {
    nk.deleteLocalData()
    localStorage.removeItem(USER_COLOR_STORAGE_KEY);
    window.location.reload();
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
}


let nk:myNakama = null;
let matchController:MatchController = null;
const matchRenderer:MyMatchRenderer = new MyMatchRenderer(canvasId);

const NAKAMA_PUBLIC_KEY = NAKAMA_SOCKET_SERVER_KEY;
const NAKAMA_URL = window.location.hostname;
const NAKAMA_PORT = "7350";
const NAKAMA_USE_SSL = false;

async function Start():Promise<void> {

    nk = new myNakama();
    await nk.connectWithDeviceId(NAKAMA_URL, NAKAMA_PUBLIC_KEY, NAKAMA_PORT, NAKAMA_USE_SSL);
    await nk.createMatch("TestMatch");
    matchController = new MatchController(nk);
    matchController.StartMatch();
    nk.onAccountUpdated.addListener(()=> {
        console.log("local update");
        matchController.LocalPlayer.RefreshUser(nk);
        username.textContent = nk.account.user.display_name;
    });
    username.textContent = nk.account.user.display_name;
}

window.addEventListener("unload", () => {
    console.log("Performing cleanup on tab close...");
    nk.socket.disconnect(true);
});

Start();

