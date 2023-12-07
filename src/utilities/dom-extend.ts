type DOMProps = {
    animating: boolean
    _temp_itxt: string
    hidden: boolean
}

interface HTMLElement {
    bringToStage: () => void;
    getProps: () => DOMProps;
    toggleAnim: () => void;
    disable: () => void;
    enable: () => void;
    _props: DOMProps;
}

function onAllEl(selector: string, cb: (e: HTMLElement) => void) {
    document.querySelectorAll(selector).forEach(e => cb(e as HTMLElement));
}

HTMLElement.prototype.bringToStage = function() {
    const spinner = document.querySelector(".spinner")!;
    spinner.classList.remove("stop");
    const delay = 250;

    onAllEl(".page", el => {
        if (el === this) return;
        el.classList.add("out");
        setTimeout(() => el.style.display = "none", delay);
    });

    setTimeout(() => {
        this.style.display = "block";

        setTimeout(() => {
            spinner.classList.add("stop");
            this.classList.remove("out");
        }, 50);
    }, delay * 2);
}

HTMLElement.prototype.getProps = function() {
    if (this._props) return this._props;
    else return (this._props = {
        animating: false,
        _temp_itxt: "",
        hidden: true
    });
}

HTMLElement.prototype.disable = function() {
    this.setAttribute("disabled", "true");
}

HTMLElement.prototype.enable = function() {
    this.removeAttribute("disabled");
}

HTMLElement.prototype.toggleAnim = function() {
    const props = this.getProps();

    if (!props.animating) {
        props._temp_itxt = this.innerText;
        this.classList.add("anim-request");
        this.innerText = "......";
        props.animating = true;
        return;
    }

    props.animating = false;
    this.classList.remove("anim-request");
    this.innerText = props._temp_itxt;
}
