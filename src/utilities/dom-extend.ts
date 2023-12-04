type DOMProps = {
    animating: boolean
    _temp_itxt: string
}

interface HTMLElement {
    getProps: () => DOMProps;
    toggleAnim: () => void;
    disable: () => void;
    enable: () => void;
    _props: DOMProps;
}

HTMLElement.prototype.getProps = function() {
    if (this._props) return this._props;
    else return (this._props = {
        animating: false,
        _temp_itxt: "",
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
