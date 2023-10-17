import { enableRouter, routeTo } from './utilities/router';
import './styles/responsive.css';
import './styles/classes.css';
import './home';

enableRouter();
const path = window.location.pathname;
if (["/"].includes(path)) routeTo("/app");
else routeTo(path, true);
