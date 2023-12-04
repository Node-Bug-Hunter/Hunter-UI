import './styles/home.css';
import { onAllEl, oneEl } from './utilities/query';
import { RequestManager } from './utilities/request-manager';

// RequestManager.one({ type: "test", msg: "Wow", email: "rishabh.kumar.pro@gmail.com" });
oneEl('#copywrt').innerHTML = `Bug-Hunter © ${new Date().getFullYear()}`;

onAllEl("#app .link", link =>
    link.addEventListener("click", (e) => {
        e.preventDefault();
        switch (link.classList[1]) {
            case 'pricing': alert("Its 100% free and open-sourced"); break;
            case 'contact': window.open("mailto:admin@040203.xyz", "_blank"); break;
            case 'articles': alert("Written articles and blogs coming soon...."); break;
            case 'github': window.open("https://github.com/Techzy-Programmer/Bug-Hunter", "_blank"); break;
            case 'linkedIn': window.open("https://www.linkedin.com/in/rishabh-kumar-438751207", "_blank"); break;
            case 'docs': window.open("https://github.com/Techzy-Programmer/Bug-Hunter/blob/main/README.md", "_blank"); break;
        }
    }
));

onAllEl("#app > .home .button", btn =>
    btn.addEventListener("click", async (e) => {
        switch (btn.getAttribute("data-action")) {
            case "verify": startVerification(btn); break;
            case "auth": startAuthentication(btn); break;
            case "console": oneEl("#app .home .authwall").classList.toggle("hide"); break;
            case "goto-npm": window.open("https://www.npmjs.com/package/bug-hunter", "_blank"); break;
        }
    }
));

async function startAuthentication(el: HTMLElement) {
    const emailEl = oneEl<HTMLInputElement>("#c-email");
    const email = emailEl.value;
    if (!email) return;

    emailEl.disable();
    el.toggleAnim();

    const response = await RequestManager.one({
        type: "authenticate",
        email
    });

    if (!response || response.rejected || !response.ok) {
        emailEl.enable();
        el.toggleAnim();
        return;
    }

    if (!response.data?.userExists) oneEl(".field.name").classList.remove("hide");
    oneEl(".field.passcode").classList.remove("hide");
    el.toggleAnim(); el.innerText = "Verify";
    el.setAttribute("data-action", "verify");
}

async function startVerification(el: HTMLElement) {
    const passcodeEl = oneEl<HTMLInputElement>("#c-passcode");
    const nameEl = oneEl<HTMLInputElement>("#c-name");
    const passcode = passcodeEl.value;
    const name = nameEl.value;

    if (!passcode || !name) return;
    passcodeEl.disable();
    nameEl.disable();
    el.toggleAnim();

    const response = await RequestManager.one({
        email: oneEl<HTMLInputElement>("#c-email").value,
        type: "verify",
        code: passcode,
        name
    });

    if (!response || response.rejected || !response.ok) {
        passcodeEl.enable();
        nameEl.enable();
        el.toggleAnim();
        return;
    }

    localStorage.setItem("AUTH_SESSION", response.data?.session);
    alert("account created!");
    resetAuthWall();
}

function resetAuthWall() {
    oneEl(".authwall").classList.add("hide");
    onAllEl(".authwall span", (el) => el.innerText = "");
    oneEl(".authwall .button").classList.remove("anim-request");
    onAllEl(".authwall input", (el) => (el as HTMLInputElement).value = "");
    onAllEl(".authwall label.field:not(.email)", (el) => el.classList.add("hide"));
}
