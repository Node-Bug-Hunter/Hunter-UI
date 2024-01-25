import { pushToast } from "../toast";
import { Transceiver } from "./transceiver";
import { FutureCB } from "../utilities/const";
import { onAllEl, oneEl } from "../utilities/query";
import { getSettings } from "../utilities/settings";
import { RequestManager } from "../utilities/request-manager";
import { populateKeysSection, toggleMonitorSecStatusState } from "./populater";

onAllEl("#console .action, #console .button", el => el.addEventListener("click", async () => {
    if (el.classList.contains("disabled")) return;
    const action = el.getAttribute("data-action");
    const settings = getSettings();
    if (!action) return;

    switch (action) {
        case "clear-logs": oneEl("#console .console-tb .tbody").innerHTML = ""; break;
        
        case "pause": case "resume": {
            if (Transceiver.active) {
                el.toggleAnim();
                const qId = Date.now();
                const toPause = action === "pause";
                const nextAction = toPause ? "Resume" : "Pause";
                await Transceiver.active.pub(`logs-monitor-${action}`, qId);

                FutureCB.set(qId.toString(),
                    () => {
                        el.toggleAnim();
                        el.innerText = nextAction;
                        toggleMonitorSecStatusState(toPause);
                        el.setAttribute("data-action", nextAction.toLowerCase());
                    }
                );
            }
            break;
        }

        case "rotate": case "revive": case "revoke":
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
        pushToast("Unable to copy to the clipboard, please use latest version of modern browser!", "err");
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
