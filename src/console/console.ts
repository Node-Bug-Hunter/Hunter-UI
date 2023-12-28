import { getPageLocation, routeTo, setPageLocation } from "../utilities/router";
import { getTransceiver, setupConsole } from "./populater";
import { getSettings } from "../utilities/settings";
import { oneEl, onAllEl } from "../utilities/query";
import "../styles/console.css";
import "./handlers";

let selectedSection = "home";
const profileIconEl = oneEl("header .profile.icon");
type Section = "home" | "monitor" | "keys" | "settings";

function renderConsole(section: Section = "home") {
    if (!getSettings() || getPageLocation() === `/console/${section}`) return;
    oneEl("header .auth.button").classList.add("hide");
    profileIconEl.classList.remove("hide");
    const consoleEl = oneEl("#console");
    setupConsole();

    switch (section) {
        case "keys":
            break;

        case "settings":
            break;

        case "monitor":
            const activeTsvr = getTransceiver();
            if (activeTsvr && activeTsvr.status === "online") activeTsvr.initiate();
            break;

        default: // Default falls to "home"
            if (section !== "home") {
                setTimeout(() => history.replaceState(null,
                    "", "/console/home"));
                section = "home";
            }
            break;
    }

    selectedSection = section;
    const isOnConsole = getPageLocation().startsWith("/console/");
    oneEl("#console > .tabs span.selected")?.classList.remove("selected");
    oneEl("#console > .container .section.push")?.classList.remove("push");
    oneEl(`#console > .tabs span[data-tab="${section}"]`).classList.add("selected");
    setTimeout(() => oneEl(`#console > .container .section[data-section="${selectedSection}"]`)?.classList.add("push"));

    if (!isOnConsole) consoleEl.bringToStage();
    setPageLocation(`/console/${section}`);
}

profileIconEl.addEventListener("click", () => alert("Profile section coming soon..."))

onAllEl("#console > .tabs span", spn => spn.addEventListener("click", function() {
    if (this.classList.contains("selected")) return;
    const nextPage = this.innerText.toLowerCase();
    
    if (nextPage === "monitor") {
            const activeTsvr = getTransceiver();
            if (!activeTsvr || activeTsvr.status !== "online") {
            const serverEl = oneEl('#console .section[data-section="home"] .server-list');

            serverEl.classList.add("flash");
            serverEl.addEventListener("animationend",
                () => serverEl.classList.remove("flash"));
            return;
        }
    }

    oneEl("#console > .tabs span.selected")?.classList.remove("selected");
    routeTo(`/console/${nextPage}`);
    this.classList.add("selected");
}));

export {
    renderConsole
}
