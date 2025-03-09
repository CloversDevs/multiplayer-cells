const message: string = "Hello from TypeScript!";
document.addEventListener("DOMContentLoaded", () => {
    const element = document.getElementById("message");
    if (element) {
        element.innerText = message;
    }
});