export class ScreenManager {
    screens: Record<string, HTMLElement>;

    constructor() {
        this.screens = {};
    }

    addScreen(screenId: string) {
        this.screens[screenId] = document.getElementById(screenId)!;
    }

    showScreen(screenName: string) {
        console.log(`Open screen: '${screenName}'`);
        if (!(screenName in this.screens)) {
            console.error(`Screen '${screenName}' not found!`);
            return;
        }

        Object.keys(this.screens).forEach(screen => console.log(`Option: '${screen}'`));
        Object.values(this.screens).forEach(screen => screen.classList.add('hidden'));

        this.screens[screenName].classList.remove('hidden');
    }
}
