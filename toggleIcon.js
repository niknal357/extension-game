if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.runtime.sendMessage({ scheme: "dark" });
}
