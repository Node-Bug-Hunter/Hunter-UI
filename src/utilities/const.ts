const PROD_URL = "https://hunter-server.040203.xyz";
const DEV_URL = "https://dev.hunter-server.040203.xyz";
const isDev = location.host === "dev.bug-hunter.040203.xyz" || location.protocol === "http:";
const SERVER_URI = isDev ? DEV_URL : PROD_URL;

export { SERVER_URI }
