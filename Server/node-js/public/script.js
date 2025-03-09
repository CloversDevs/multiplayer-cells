"use strict";
const message = "Hello from TypeScript!";
document.addEventListener("DOMContentLoaded", () => {
    const element = document.getElementById("message");
    if (element) {
        element.innerText = message;
    }
});
