import { pushToast } from "../toast";
import { onAllEl, oneEl } from "../utilities/query";
import { routeTo } from "../utilities/router";
import { getSettings } from "../utilities/settings";
import { Server } from "../utilities/types";
import { setTransceiver } from "./console";
import { Transceiver } from "./transceiver";

let homePopulated = false;
const keysSec = oneEl('#console > .container > div.section[data-section="keys"]');
const homeSec = oneEl('#console > .container > div.section[data-section="home"]');
const monitorSec = oneEl('#console > .container > div.section[data-section="monitor"]');
const settingsSec = oneEl('#console > .container > div.section[data-section="settings"]');

export function populateUI() {
    populateHomeSection();
    populateMonitorSection();
    populateKeysSection();
    populateSettingsSection();
}

function populateHomeSection() {
    if (homePopulated) return;
    homePopulated = true;

    const emailsEl = oneEl(".data .emails", homeSec);
    const timeEl = oneEl(".data .time", homeSec);
    const ipEl = oneEl(".data .ip", homeSec);
    const settings = getSettings();

    ipEl.innerText = settings.stats.lastIP;
    timeEl.innerText = settings.stats.lastTime;
    emailsEl.innerText = `${settings.stats.totalEmails} in total`;

    if (Object.keys(settings.cluster).length === 0) return;
    oneEl(".server-list", homeSec).classList.remove("na");
    for (const key in settings.cluster) addServerToListUI(settings.cluster[key], key);
}

function addServerToListUI(server: Server, serverId: string) {
    const liEl = document.createElement("li");
    liEl.setAttribute("data-state", !server
        .remoteActive ? "inactive" : "connecting");
    liEl.setAttribute("data-id", serverId);
    liEl.classList.add("flex");

    let transceiver: Transceiver;
    if (server.remoteActive) transceiver =
        Transceiver.create(liEl, serverId);

    function handleClick() {
        if (!server.remoteActive) return pushToast("Remote monitoring is disabled for this server", "info");
        const svrState = liEl.getAttribute("data-state")!;

        if (svrState === "online") {
            setTransceiver(transceiver);
            return routeTo("/console/monitor");
        }

        pushToast(`Server '${server.name}' is not online!`, "info", 2);
    }

    const divEl = document.createElement("div");
    divEl.classList.add("flex", "c");

    const bEL = document.createElement("b");
    const iEL = document.createElement("i");
    iEL.innerText = server.lastIP;
    bEL.innerText = server.name;

    divEl.appendChild(bEL);
    divEl.appendChild(iEL);
    liEl.appendChild(divEl);
    liEl.addEventListener("click", handleClick);
    oneEl(".server-list > ul", homeSec).prepend(liEl);
}

function populateMonitorSection() {
    // ToDo: Yet to be implemented
}

export function populateKeysSection() {
    const toggleActionEl = oneEl(".api-key .action:last-child", keysSec);
    const keyTxtEl = oneEl(".api-key > span", keysSec);
    const apiKey = getSettings().apiKey;
    const hasKey = Boolean(apiKey);
    
    onAllEl(".action:not(.red, .green)", el => el
        .classList[hasKey ? "remove" : "add"]("disabled"), keysSec);
    
    if (!hasKey) {
        keyTxtEl.innerText = `API-Access Disabled`;
        toggleActionEl.classList.remove("red");
        toggleActionEl.classList.add("green");
        toggleActionEl.innerText = "Enable";
        return;
    }

    toggleActionEl.classList.add("red");
    toggleActionEl.innerText = "Disable";
    toggleActionEl.classList.remove("green");
    keyTxtEl.innerText = `${apiKey.split(":")[0]}:${"#".repeat(16)}`;
}

function populateSettingsSection() {
    // ToDo: Yet to be implemented
}
