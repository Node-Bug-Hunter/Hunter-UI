import { RequestManager } from './utilities/request-manager';
import { onAllEl, oneEl } from './utilities/query';
import { setSettings } from './utilities/settings';
import { routeTo } from './utilities/router';
import { Settings } from './utilities/types';
import './styles/home.css';

if (localStorage.getItem("AUTH_SESSION"))
    RequestManager.one({ type: "authcheck" }).then(resp => {
        if (!resp || resp.rejected || !resp.ok) {
            if (!resp?.rejected && resp?.code === 401)
                localStorage.removeItem("AUTH_SESSION");
            routeTo("/app");
            return;
        }

        setPostAuthUI(false, resp.data as Settings);
    });
else routeTo("/app");

// setSettings({ stats: {}, cluster: {}} as any);
// routeTo("/console/monitor");

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

onAllEl(".button", btn => {
    btn.addEventListener("click", async (e) => {
        switch (btn.getAttribute("data-action")) {
            case "dash": routeTo("/console/home"); break;
            case "verify": startVerification(btn); break;
            case "auth": startAuthentication(btn); break;
            case "console": oneEl("#app .home .authwall").classList.toggle("hide"); break;
            case "goto-npm": window.open("https://www.npmjs.com/package/bug-hunter", "_blank"); break;
        }
    });
});

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

    if (!response.data?.userExists)
        oneEl(".field.name").classList.remove("hide");
    oneEl(".field.passcode").classList.remove("hide");
    el.toggleAnim(); el.innerText = "Verify";
    el.setAttribute("data-action", "verify");
}

async function startVerification(el: HTMLElement) {
    const passcodeEl = oneEl<HTMLInputElement>("#c-passcode");
    const nameEl = oneEl<HTMLInputElement>("#c-name");
    const passcode = passcodeEl.value;
    const name = nameEl.value;

    if (!passcode) return;
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

    const mySettings = response.data as Settings;
    setPostAuthUI(true, mySettings);
    resetAuthWall();
}

function resetAuthWall() {
    oneEl(".authwall").classList.add("hide");
    onAllEl(".authwall span", (el) => el.innerText = "");

    const btnEl = oneEl(".authwall .button");
    btnEl.setAttribute("data-action", "auth");
    btnEl.classList.remove("anim-request");
    btnEl.innerText = "Authenticate";
    btnEl._props.animating = false;

    onAllEl(".authwall input", (el) => {
        (el as HTMLInputElement).value = "";
        el.enable();
    });

    onAllEl(".authwall label.field:not(.email)", (el) => el.classList.add("hide"));
}

function setPostAuthUI(redirect = false, settings: Settings) {
    const em = oneEl<HTMLInputElement>("#c-email").value;
    localStorage.setItem("AUTH_SESSION", settings.session);
    if (em) localStorage.setItem("AUTH_EMAIL", em);
    setSettings(settings);

    const isConsoleLoc = location.pathname.startsWith("/console/") && location.pathname.length >= 10;
    onAllEl('.button[data-action="console"]', (el) => el.setAttribute("data-action", "dash"));
    oneEl(".notif.block").innerText = "Manage resources >";
    const toRedirect = redirect || isConsoleLoc;

    if (redirect) return routeTo("/console/home");
    routeTo(isConsoleLoc ? location.pathname : "/app");
}
