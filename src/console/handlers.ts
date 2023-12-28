import { pushToast } from "../toast";
import { FutureCB } from "../utilities/const";
import { onAllEl, oneEl } from "../utilities/query";
import { getSettings } from "../utilities/settings";
import { RequestManager } from "../utilities/request-manager";
import { getTransceiver, populateKeysSection } from "./populater";

onAllEl("#console .action", el => el.addEventListener("click", async () => {
    if (el.classList.contains("disabled")) return;
    const action = el.getAttribute("data-action");
    const settings = getSettings();
    if (!action) return;

    switch (action) {
        case "clear-logs": oneEl("#console .console-tb .tbody").innerHTML = ""; break;
        
        case "pause": case "resume": {
            const transceiver = getTransceiver();

            if (transceiver) {
                el.toggleAnim();
                const toPause = action === "pause";
                const nextAction = toPause ? "Resume" : "Pause";
                const qId = await transceiver[toPause ? "conclude" : "initiate"]();
                
                FutureCB.set(qId, () => {
                    el.toggleAnim();
                    el.innerText = nextAction;
                    el.setAttribute("data-action", nextAction.toLowerCase());
                });
            }
            break;
        }
 
        case "rotate":
        case "revive":
        case "revoke":
            workOnKey(el, action);
            break;

        case "copy": copyToClipboard(settings.apiKey); break;
        case "": break;
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

async function workOnKey(el: HTMLElement, action: any) {
    el.toggleAnim();
    const keyOP = await RequestManager
        .one({ type : action });
    el.toggleAnim();

    if (keyOP && !keyOP.rejected && keyOP.ok) {
        getSettings().apiKey = keyOP.data;
        populateKeysSection();
    }
}
