import './styles/responsive.css';
import './utilities/proto-extend';
import './styles/classes.css';
import './home';

const updateTheme = (isDark: boolean) => document.body
    .setAttribute("data-theme", isDark ? "dark" : "light");

const checkDarkMode = () => window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)");
const darkQuery = checkDarkMode();
updateTheme(darkQuery.matches);

darkQuery.addEventListener("change", () => 
    updateTheme(checkDarkMode().matches));
