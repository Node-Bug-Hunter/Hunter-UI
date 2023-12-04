import { enableRouter, routeTo } from './utilities/router';
import './styles/responsive.css';
import './utilities/dom-extend';
import './styles/classes.css';
import './home';

enableRouter();
const path = window.location.pathname;
if (["/"].includes(path))
    routeTo("/app");
else routeTo(path, true);

const updateTheme = (isDark: boolean) => document.body
    .setAttribute("data-theme", isDark ? "dark" : "light");

const checkDarkMode = () => window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)");
const darkQuery = checkDarkMode();
updateTheme(darkQuery.matches);

darkQuery.addEventListener("change", () => 
    updateTheme(checkDarkMode().matches));
