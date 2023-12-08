import { renderConsole } from "../console/console";
import { oneEl } from "./query";
import Navigo from "navigo";

let where: string = "";
const router = new Navigo("/");
const getPageLocation = (): string => where;
const setPageLocation = (loc: string) => where = loc;
const routeTo = (url: string) => router.navigate(url);

router.on("/console/:section", (match) => {
    if (match && match.data && match.data["section"])
        renderConsole(match.data["section"] as any);
})
.on("/app", () => renderHomepage())
.on(() => routeTo("/app"));

function renderHomepage() {
    if (getPageLocation() === "app") return;
    history.replaceState(null, "page", "/app");

    oneEl("header .auth.button").classList.remove("hide");
    oneEl("header .profile.icon").classList.add("hide");
    oneEl("#app").bringToStage();
    setPageLocation("app");
}

export {
    getPageLocation,
    setPageLocation,
    routeTo
}
