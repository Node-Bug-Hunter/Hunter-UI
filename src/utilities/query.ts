function onAllEl(selector: string, cb: (e: HTMLElement) => void, parent?: HTMLElement) {
    (parent ? parent : document).querySelectorAll(selector).forEach(e => cb(e as HTMLElement));
}

function oneEl<T extends HTMLElement>(selector: string, parent?: HTMLElement): T {
    return (parent ? parent : document).querySelector(selector)!;
}

function createEl<K extends keyof HTMLElementTagNameMap>(tag: K, attrs?: {[x: string]: string}): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);

    if (attrs && typeof attrs === "object") {
        for (const key in attrs) {
            if (key === "class") el.classList
                .add(...attrs[key].split(" "));
            else el.setAttribute(key, attrs[key]);
        }
    }

    return el;
}

export {
    createEl,
    onAllEl,
    oneEl
}
