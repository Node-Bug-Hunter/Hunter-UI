import { pushToast } from "../toast";
import { onAllEl } from "../utilities/query";
import { getSettings } from "../utilities/settings";

onAllEl("#console .action", el => el.addEventListener("click", () => {
    if (el.classList.contains("disabled")) return;
    const action = el.getAttribute("data-action");
    const settings = getSettings();
    if (!action) return;

    switch (action) {
        case "copy": copyToClipboard(settings.apiKey); break;

        case "rotate":
            break;
    
        case "enable|disable":
            break;
        
        case "":
            break;
    }
}));

async function copyToClipboard(text?: string) {
    if (!text) return;

    try {
        // Try to copy the text
        await navigator.clipboard.writeText(text);
        pushToast("API key copied to Clipboard", "info", 2);
        return true;
    }
    catch {
        pushToast("Unable to copy to the clipboard!", "err");
        return false;
    }
}
