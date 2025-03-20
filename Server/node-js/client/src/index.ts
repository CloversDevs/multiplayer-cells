import { myNakama } from "./myNakama";
import { MatchController } from "./myMatch";
import { MyMatchRenderer } from "./myMatchRenderer";

// Setup canvas to display the match on.
const canvasId:string = "gameCanvas"; 
const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
if(!canvas) 
{
    console.error("no canvas");
}
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


/////////////////////
class ScreenManager {
    screens: Record<string, HTMLElement>;

    constructor() {
        this.screens = {
            gameScreen: document.getElementById('gameScreen')!,
            profileScreen: document.getElementById('profileScreen')!,
        };
    }

    showScreen(screenName: string) {
    		console.log(`Open screen: '${screenName}'`);
        Object.keys(this.screens).forEach(screen => console.log(`Option: '${screen}'`));
        Object.values(this.screens).forEach(screen => screen.classList.add('hidden'));
         
        this.screens[screenName].classList.remove('hidden');
    }
}

const screenManager = new ScreenManager();

// Switch to Profile Selection on Load
//screenManager.showScreen('profile');

// Handle Character Selection
document.getElementById('characterSelectionButton')?.addEventListener('click', () => {
    screenManager.showScreen('profileScreen');
});

// Handle Character Selection
document.getElementById('closeProfileScreenButton')?.addEventListener('click', () => {
    screenManager.showScreen('gameScreen');
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

    // Exposing functions globally (optional, for debugging)
    (window as any).setCharacterImage = setCharacterImage;
    (window as any).setPowerText = setPowerText;
});




//////////////////////


// Prevent touch scrolling and pinch zooming
document.addEventListener("touchmove", (event) => {
    event.preventDefault();
}, { passive: false });

document.addEventListener("gesturestart", (event) => {
    event.preventDefault();
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
    localStorage.removeItem(DEVICE_ID_STORAGE_KEY);
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

const DEVICE_ID_STORAGE_KEY = "deviceID";
const NAKAMA_PUBLIC_KEY = "defaultkey";
const NAKAMA_URL = window.location.hostname;
const NAKAMA_PORT = "7350";
const NAKAMA_USE_SSL = false;

const generateUUID = ():string => {
    try
    {
        return crypto.randomUUID();
    }
    catch
    {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            let r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
};

async function Start():Promise<void> {
    let firstLogIn:boolean = false;

    // Generate a new user ID if none exists
    const getOrCreateDeviceId = ():string=> {
        let deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
        if (!deviceId) {
            firstLogIn = true;
            deviceId = generateUUID();
            console.info(`[BOOT] Generate new device id: '${deviceId}'`);
            localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
            return deviceId;
        }
        console.info(`[BOOT] Load existing device id: '${deviceId}'`);
        return deviceId;
    }
    let deviceId = getOrCreateDeviceId();

    nk = new myNakama();
    await nk.connect(deviceId, NAKAMA_URL, NAKAMA_PUBLIC_KEY, NAKAMA_PORT, NAKAMA_USE_SSL);
    if(firstLogIn)
    {
        await nk.setDisplayName("anonymous");
    }
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

