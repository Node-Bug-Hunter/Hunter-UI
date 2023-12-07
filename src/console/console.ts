import { getPageLocation, routeTo, setPageLocation } from "../utilities/router";
import { getSettings } from "../utilities/settings";
import { oneEl } from "../utilities/query";

const profileIconEl = oneEl("header .profile.icon");
type Section = "home" | "keys" | "settings";

function renderConsole(section: Section = "home") {
    let pageLocation = `/console/${section}`;
    if (!getSettings() || getPageLocation() === pageLocation) return;

    oneEl("header .auth.button").classList.add("hide");
    profileIconEl.classList.remove("hide");
    const consoleEl = oneEl("#console");

    // ToDo: Implement Console Dashboard
    consoleEl.innerHTML = `<br/><i>Console Coming Soon....</i>`;

    switch (section) {
        case "keys":
            break;

        case "settings":
            break;

        default: // Default falls to "home"
            pageLocation = `/console/home`;
            break;
    }

    consoleEl.bringToStage();
    setPageLocation(pageLocation);
    if (section) history.replaceState(null, "page", pageLocation);
}

profileIconEl.addEventListener("click", () => alert("Profile section coming soon..."))

export {
    renderConsole
}
