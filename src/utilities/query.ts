function onAllEl(selector: string, cb: (e: HTMLElement) => void) {
    document.querySelectorAll(selector).forEach(e => cb(e as HTMLElement));
}

function oneEl(selector: string) {
    return document.querySelector(selector)!;
}

export {
    onAllEl,
    oneEl
}
