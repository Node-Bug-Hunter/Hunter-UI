import { oneEl } from "./utilities/query";
const bufferTime = 100;
let timeOut: any;

export function pushToast(msg: string, type: "info" | "err" | "warn" | "ok", delayS: number = 5) {
    const toastTextEl = oneEl("div.note-msg > b");
    const toastEl = oneEl("div.note-msg");
    disposeToast(toastEl);

    setTimeout(() => {
        timeOut = setTimeout(() => disposeToast(toastEl), (delayS * 1000));
        toastEl.setAttribute("data-type", type);
        toastEl.classList.add("display");
        toastTextEl.innerText = msg;
    }, bufferTime);
}

function disposeToast(el: HTMLElement) {
    el.classList.remove("display");
    clearTimeout(timeOut);
}

oneEl("div.note-msg > span").addEventListener("click",
    () => disposeToast(oneEl("div.note-msg")));
