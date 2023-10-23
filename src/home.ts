import './styles/home.css';
import { onAllEl, oneEl } from './utilities/query';

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
    btn.addEventListener("click", (e) => {
        switch (btn.getAttribute("data-action")) {
            case "console": alert("Working on this feature, it'll be implemented soon...."); break;
            case "goto-npm": window.open("https://www.npmjs.com/package/bug-hunter", "_blank"); break;
        }
    }
));
