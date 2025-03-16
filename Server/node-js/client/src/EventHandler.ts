
export class EventHandler<T> {
    private listeners: Array<(data: T) => void> = [];
    constructor() {
        this.invoke = this.invoke.bind(this); // Bind invoke to the instance
    }

    // Allow users to add listeners
    public addListener(listener: (data: T) => void): () => void {
        this.listeners.push(listener);
        return () => this.removeListener(listener);
    }

    // Allow users to remove listeners
    public removeListener(listener: (data: T) => void): void {
        this.listeners = this.listeners.filter((l) => l !== listener);
    }

    // Notify all listeners when event data is received
    public invoke(data: T): void {
        this.listeners.forEach((listener) => listener(data));
    }
}
