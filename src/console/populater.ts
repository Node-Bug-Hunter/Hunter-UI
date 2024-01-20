import { createEl, onAllEl, oneEl } from "../utilities/query";
import { getSettings, setSettings } from "../utilities/settings";
import { routeTo } from "../utilities/router";
import { Server } from "../utilities/types";
import { Transceiver } from "./transceiver";
import { pushToast } from "../toast";

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
        tmpTsvr = Transceiver.create(liEl, serverId, server.name);
        if (selected && selected === serverId) Transceiver.active = tmpTsvr;
    }

    function handleClick() {
        if (!server.remoteActive) return pushToast("Remote monitoring is disabled for this server", "info");
        const svrState = liEl.getAttribute("data-state")!;

        if (svrState === "online") {
            localStorage.setItem("ACTIVE_TRANSCEIVER", serverId);

            if (Transceiver.active !== tmpTsvr) {
                oneEl(".console-tb .status .action", monitorSec).click();
                Transceiver.active?.off("status-change", changeMonitorSecState);
                Transceiver.active?.pub("logs-monitor-pause", 0);
            }

            Transceiver.active = tmpTsvr;
            routeTo("/console/monitor");
            changeMonitorSecState(true);

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
    Transceiver.active?.on("status-change", changeMonitorSecState);
}

function changeMonitorSecState(isOnline: boolean) {
    oneEl(".status .button", monitorSec).classList.toggle("disabled", !isOnline);
    const monitorBText = oneEl(".status b", monitorSec);
    const bottomTabsEl = oneEl(".tabs.down");

    const now = "online", then = "offline";
    bottomTabsEl.setAttribute("data-state", isOnline ? "on" : "off");
    oneEl("div", bottomTabsEl).innerHTML = `${isOnline ? now : then}: '${Transceiver.active?.serverName}'`

    if (!isOnline) {
        monitorBText.getProps()._temp_itxt = monitorBText.innerText;
        monitorBText.innerText = "Server offline";
    }
    else if (monitorBText.getProps()._temp_itxt)
        monitorBText.innerText = monitorBText.getProps()._temp_itxt;
}

export function toggleMonitorSecStatusState(isPaused: boolean) {
    const settings = getSettings();
    if (isPaused !== Boolean(settings.params.logsMonitoringPaused)) return;

    setSettings({
        ...settings,
        params: {
            ...settings.params,
            logsMonitoringPaused: !isPaused
        }
    });

    const monitorStatusEl = oneEl(".status", monitorSec);
    const statusBtnEl = oneEl(".button", monitorStatusEl);
    oneEl(".loading", monitorStatusEl).classList.toggle("paused", isPaused);
    oneEl("b", monitorStatusEl).innerText = `Monitoring ${isPaused ? "paused" : "active"}`;
    statusBtnEl.setAttribute("data-action", isPaused ? "resume" : "pause");
    statusBtnEl.innerText = isPaused ? "Resume" : "Pause";
}

function populateMonitorSection() {
    if (monitorPopulated) return;
    monitorPopulated = true;

    resetMonitorSection();
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

function resetMonitorSection() {
    oneEl(".console-tb .status b", monitorSec).innerText = "Monitoring paused";
    oneEl(".console-tb .status span.loading", monitorSec).classList.add("paused");
    const actButtonEl = oneEl(".console-tb .status .button", monitorSec);
    actButtonEl.setAttribute("data-action", "resume");
    actButtonEl.innerText = "Start";
}
