import crossroads from "crossroads";
import { DataLoader } from "./data-loader";

export function enableRouter() {
    crossroads.addRoute("/{section}", renderHomepage);
    crossroads.addRoute("/dash/{feature}/:sub:", renderDashboard);
}

export function routeTo(url: string, bypass?: boolean) {
    if (!bypass) {
        if (url === "/app") history.replaceState(null, "page", url);
        else history.replaceState(null, "page", url);
    }

    crossroads.parse(url);
}

function renderHomepage(where: string) {
    console.log("Homepage:", where, "Type:", typeof where);

    switch (where) {
        case "app":
            // 
            break;
    
        case "features":
            // 
            break;
    
        case "faq":
            // 
            break;
    }
}

function renderDashboard(feature: string, sub: string) {
    console.log("Dashboard:", feature, sub);

    switch (feature) {
        case "resources":
            if (!sub) return renderServer(sub);
            DataLoader.pullResources();
            break;
    }
}

function renderServer(server: string) {
    DataLoader.pullServerData(server);
}

window.addEventListener("popstate", () => {
    let path = window.location.pathname;
    if (path === "/") path = "/app";
    routeTo(path);
});
