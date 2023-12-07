import { renderConsole } from "../console/console";
import crossroads from "crossroads";
import { oneEl } from "./query";
let where: string = "";

export function enableRouter() {
    crossroads.addRoute("/{section}", renderHomepage);
    crossroads.addRoute("/console/{feature}", renderConsole);
}

export function routeTo(url: string, bypass?: boolean) {
    if (!bypass) history.replaceState(null, "page", url);
    if (url.startsWith("/console/"))
        renderConsole(url.split("/")[2] as any);
    else renderHomepage();
    crossroads.parse(url);
}

export function setPageLocation(loc: string) {
    where = loc;
}

export function getPageLocation(): string {
    return where;
}

function renderHomepage() {
    if (getPageLocation() === "app") return;
    history.replaceState(null, "page", "/app");

    oneEl("header .auth.button").classList.remove("hide");
    oneEl("header .profile.icon").classList.add("hide");
    oneEl("#app").bringToStage();
    setPageLocation("app");
}

window.addEventListener("popstate", () => {
    let path = window.location.pathname;
    if (path === "/") path = "/app";
    routeTo(path);
});
