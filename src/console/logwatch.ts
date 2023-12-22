import { createEl, oneEl } from "../utilities/query";
import { LogObject } from "../utilities/types";
import { JSON_Stringify } from "./transceiver";

type Holder = "mark" | "key" | "null" | "undefined" | "boolean" | "string" | "number" | "symbol" | "bigint";

function mapToSpan(holder: Holder, value: string) {
    function escapeHtml(unsafe: string) {
        return unsafe.replace(/[&<"']/g, function(m) {
            switch (m) {
                case '&': return '&amp;';
                case '<': return '&lt;';
                case '"': return '&quot;';
                case "'": return '&#039;';
                default: return "";
            }
        });
    }

    const breakStr = (holder === "mark" && ['{', '[', ']', '}'].includes(value)) ? "<br>" : "";
    return `<span data-holder="${holder}" style="color: var(--json-${holder})">${escapeHtml(value)}</span>${breakStr}`;
}

export function parseJsonToHtml(value: any, indent = 2, level = 0) {
    const isNested = typeof value === "object" && Boolean(value);
    const space = "&nbsp;".repeat(indent).repeat(++level);
    let htmlRep = "", type;

    function buildNestedTree() {
        const isArray = Array.isArray(value);
        const marks = isArray ? ['[', ']'] : ['{', '}'];
        const backSpace = "&nbsp;".repeat(indent).repeat(level - 1);
        const commaEnd = (level > 1 ? "," : "") + "<br>";
        let repStr = mapToSpan("mark", marks[0]);

        if (Object.keys(value).length === 0) {
            const secPart = mapToSpan("mark", marks[1]).trimBR();
            return `${repStr.trimBR()}${secPart}${commaEnd}`;
        }

        for (const key in value) {
            if (!Object.hasOwnProperty.call(value, key)) continue;
            const preMarkup = isArray ? space : `${space}${mapToSpan("key", key)}${mapToSpan("mark", ":")} `;
            repStr += preMarkup + parseJsonToHtml(value[key], indent, level);
        }

        repStr += backSpace + mapToSpan("mark", marks[1]).trimBR() + commaEnd;
        return repStr.replace(/&zwnj;/g, ",<br>");
    }

    if (isNested) return buildNestedTree();
    
    switch (type = typeof value) {
        case "number":
            if (Math.abs(value) === Infinity) htmlRep = mapToSpan(type, "Infinity");
            else if (Number.isNaN(value)) htmlRep = mapToSpan(type, "NaN");
            else htmlRep = mapToSpan(type, `${value}`);
            break;

        case "undefined": htmlRep = mapToSpan(type, 'undefined'); break;
        case "boolean": htmlRep = mapToSpan(type, value.toString()); break;
        case "symbol": htmlRep = mapToSpan(type, `${value.toString()}`); break;
        case "bigint": htmlRep = mapToSpan(type, `${value.toString()}n`); break;
        case "object": if (value === null) htmlRep = mapToSpan("null", "null"); break;
        case "string": htmlRep = mapToSpan(type, `"${value.replace(/"/g, "\\\"")}"`); break;
        default: break;
    }

    return htmlRep + "&zwnj;";
}

export function buildLogDOM(logObject: LogObject) {
    const { data, logLevel, timeStamp, at } = logObject;

    function getString(value: any) {
        switch (typeof value) {
            case "number": case "bigint": case "boolean": case "symbol": return value.toString();
            case "object": return JSON_Stringify(value);
            case "undefined": return "undefined";
            case "function": return "() => {}";
            case "string": return value;
        }
    }

    function generatePreview(preview = "") {
        for (const log of data) {
            if (preview.length >= 128) break;
            preview += getString(log.logValue) + " ";
        }

        return preview;
    }

    let clrStr = "b";
    if (logLevel === "ERROR") clrStr = "r";
    else if (logLevel === "LOG") clrStr = "g";
    else if (logLevel === "WARN") clrStr = "y";

    const tileEl = createEl("div", { class: "tile" });
    const trEl = createEl("div", { class: "tr flex" });
    const previewEl = createEl("div", { class: "preview" });
    const actualEl = createEl("div", { class: "actual" });
    const logsEl = createEl("div", { class: "logs flex c" });
    const traceEl = createEl("div", { class: "trace scrollable" });
    const traceFuncEl = createEl("b", { "data-clr": "y" });
    const traceFileEl = createEl("b", { "data-clr": "b" });
    const tracePosEl = createEl("b", { "data-clr": "g" });
    const levelEl = createEl("div", { class: "td", "data-clr": clrStr });
    const timeEl = createEl("div", { class: "td", "data-clr": "g" });
    const sizeEl = createEl("div", { class: "td", "data-clr": "b" });
    for (const metaEl of [levelEl, timeEl, sizeEl]) trEl.append(metaEl);
    for (const logEl of [logsEl, traceEl]) actualEl.append(logEl);
    for (const topEl of [trEl, previewEl, actualEl]) tileEl.append(topEl);
    oneEl("#console .console-tb > .tbody").prepend(tileEl);

    const sizeStr = calculateSize(data.map(log => getString(log.logValue)).join(""));
    const timeStr = getDateTimeInIST(timeStamp);
    const previewStr = generatePreview();

    tracePosEl.innerText = `line: ${at.line}, column: ${at.column}`;
    traceFuncEl.innerText = at.function;
    traceFileEl.innerText = at.file;
    
    traceEl.innerHTML = `at: '${traceFuncEl.outerHTML}' [${traceFileEl.outerHTML}] {${tracePosEl.outerHTML}}`;
    previewEl.innerText = previewStr;
    levelEl.innerText = logLevel;
    timeEl.innerText = timeStr;
    sizeEl.innerText = sizeStr;

    for (const log of data) {
        if (log.type === "Object") log.type = "object";
        const custom = log.type.startsWith("<") && log.type.endsWith(">");
        const logType = custom ? typeof log.logValue : `${log.type} object`;
        const logEl = createEl("div", { class: `log flex scrollable ${logType}` });
        const lDataEl = createEl("span", { class: `l-data` });
        const typeEl = createEl("div", { class: `type` });
        const logHTML = parseJsonToHtml(log.logValue);
        if (custom) log.type = log.type.slice(1, -1);

        logEl.append(typeEl, lDataEl);
        lDataEl.innerHTML = logHTML;
        typeEl.innerText = log.type;
        logsEl.append(logEl);
    }

    trEl.addEventListener("click", () => {
        tileEl.classList.toggle("open");
    });
}

function calculateSize(logsStr: string): string {
    if (!logsStr) return "0 B";
    if (logsStr.length < 1000) return `${logsStr.length} B`;
    if (logsStr.length < 1000000) return `${(logsStr.length / 1024).toFixed(1)} Kb`;
    return `${(logsStr.length / (1024 * 1024)).toFixed(1)} Mb`;
}

function getDateTimeInIST(timestamp?: number): string {
    const ts = timestamp ? timestamp : Date.now();

    return (new Date(ts)).toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        minute: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        month: 'short',
        day: 'numeric',
        hour12: true
    });
}
