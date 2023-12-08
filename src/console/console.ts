import { getPageLocation, routeTo, setPageLocation } from "../utilities/router";
import { getSettings } from "../utilities/settings";
import { oneEl, onAllEl } from "../utilities/query";
import "../styles/console.css";

const profileIconEl = oneEl("header .profile.icon");
type Section = "home" | "monitor" | "keys" | "settings";

function renderConsole(section: Section = "home") {
    if (!getSettings() || getPageLocation() === `/console/${section}`) return;
    oneEl("header .auth.button").classList.add("hide");
    profileIconEl.classList.remove("hide");
    const consoleEl = oneEl("#console");

    switch (section) {
        case "keys":
            break;

        case "settings":
            break;

        case "monitor":
            break;

        default: // Default falls to "home"
            if (section !== "home") {
                setTimeout(() => history.replaceState(null,
                    "", "/console/home"));
                section = "home";
            }
            break;
    }

    const isOnConsole = getPageLocation().startsWith("/console/");
    oneEl("#console > .tabs span.selected")?.classList.remove("selected");
    oneEl(`#console > .tabs span[data-tab="${section}"]`).classList.add("selected");

    if (!isOnConsole) consoleEl.bringToStage();
    setPageLocation(`/console/${section}`);
}

profileIconEl.addEventListener("click", () => alert("Profile section coming soon..."))

onAllEl("#console > .tabs span", spn => spn.addEventListener("click", function() {
    if (this.classList.contains("selected")) return;
    
    oneEl("#console > .tabs span.selected")?.classList.remove("selected");
    routeTo(`/console/${this.innerText.toLowerCase()}`);
    this.classList.add("selected");
}));

export {
    renderConsole
}
