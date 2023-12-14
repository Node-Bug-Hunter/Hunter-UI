function onAllEl(selector: string, cb: (e: HTMLElement) => void, parent?: HTMLElement) {
    (parent ? parent : document).querySelectorAll(selector).forEach(e => cb(e as HTMLElement));
}

function oneEl<T extends HTMLElement>(selector: string, parent?: HTMLElement): T {
    return (parent ? parent : document).querySelector(selector)!;
}

export {
    onAllEl,
    oneEl
}
