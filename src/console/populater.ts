import { createEl, onAllEl, oneEl } from "../utilities/query";
import { getSettings } from "../utilities/settings";
import { routeTo } from "../utilities/router";
import { Server } from "../utilities/types";
import { Transceiver } from "./transceiver";
import { pushToast } from "../toast";

let transceiver: Transceiver;
export const getTransceiver = () => transceiver;
let homePopulated = false, monitorPopulated = false;

const keysSec = oneEl('#console > .container > div.section[data-section="keys"]');
const homeSec = oneEl('#console > .container > div.section[data-section="home"]');
const monitorSec = oneEl('#console > .container > div.section[data-section="monitor"]');
const settingsSec = oneEl('#console > .container > div.section[data-section="settings"]');

export function setupConsole() {
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
    if (!getSettings().apiKey || Object.keys(settings.cluster).length === 0) return;

    oneEl(".server-list", homeSec).classList.remove("na");
    for (const key in settings.cluster) addServerToListUI(settings.cluster[key], key, localStorage.getItem("ACTIVE_TRANSCEIVER"));
}

function addServerToListUI(server: Server, serverId: string, selected: string | null) {
    const liEl = createEl("li", {
        "data-state": !server.remoteActive ? "inactive" : "connecting",
        "data-id": serverId,
        class: "flex",
    });
    
    let tmpTsvr: Transceiver;
    if (server.remoteActive) {
        tmpTsvr = Transceiver.create(liEl, serverId);
        if (selected && selected === serverId) transceiver = tmpTsvr;
    }

    function handleClick() {
        if (!server.remoteActive) return pushToast("Remote monitoring is disabled for this server", "info");
        const svrState = liEl.getAttribute("data-state")!;

        if (svrState === "online") {
            localStorage.setItem("ACTIVE_TRANSCEIVER", serverId);
            if (transceiver !== tmpTsvr) transceiver?.conclude();
            transceiver = tmpTsvr;
            routeTo("/console/monitor");

            return;
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
    setTimeout(() => (tmpTsvr.status !== "online") &&
        liEl.setAttribute("data-state", "offline"), 20_000);
}

function populateMonitorSection() {
    if (monitorPopulated) return;
    monitorPopulated = true;

    // ToDo: Further implementation required
}

export function populateKeysSection() {
    const toggleActionEl = oneEl(".api-key .action:last-child", keysSec);
    const keyTxtEl = oneEl(".api-key > span", keysSec);
    const apiKey = getSettings().apiKey;
    const hasKey = Boolean(apiKey);
    
    onAllEl(".action:not(.red, .green)", el => el
        .classList[hasKey ? "remove" : "add"]("disabled"), keysSec);
    
    if (!hasKey) {
        toggleActionEl.setAttribute("data-action", "revive");
        keyTxtEl.innerText = `API-Access Disabled`;
        toggleActionEl.classList.remove("red");
        toggleActionEl.classList.add("green");
        toggleActionEl.innerText = "Enable";
        return;
    }

    toggleActionEl.classList.add("red");
    toggleActionEl.innerText = "Disable";
    toggleActionEl.classList.remove("green");
    toggleActionEl.setAttribute("data-action", "revoke");
    keyTxtEl.innerText = `${apiKey.split(":")[0]}:${"#".repeat(16)}`;
}

function populateSettingsSection() {
    // ToDo: Yet to be implemented
}
