import { Settings } from "./types";

let settings: Settings;

function setSettings(_s: Settings) {
    settings = _s;
    if (!settings.params)
        settings.params = {};
}

function getSettings() {
    return settings;
}

export { setSettings, getSettings }
