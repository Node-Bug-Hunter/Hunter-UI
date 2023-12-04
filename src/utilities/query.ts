function onAllEl(selector: string, cb: (e: HTMLElement) => void) {
    document.querySelectorAll(selector).forEach(e => cb(e as HTMLElement));
}

function oneEl<T extends HTMLElement>(selector: string): T {
    return document.querySelector(selector)!;
}

export {
    onAllEl,
    oneEl
}
