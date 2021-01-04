import { transition } from "./utils";
import {v4 as uuidV4} from 'uuid'

let activeUI: UI | null = null;
let mousePos = {x: 0, y: 0};
const wrapper = document.querySelector("#wrapper") as HTMLElement;

wrapper.addEventListener("mousemove", e => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
});

function getMousePos() {
    return mousePos;
}

function getActiveUI() {
    return activeUI;
}

function setActiveUI(ui: UI | null) {
    activeUI = ui;
}

function isUILoaded(ui: UI) {
    return activeUI?.uuid === ui.uuid;
}

function loadUI(ui: UI | null) {
    transition(async () => {
        await activeUI?.destroy();
        if(ui !== null) {
            setActiveUI(ui);
            await ui.init();
        } else {
            setActiveUI(null);
        }
    });
}

abstract class UI {
    stylesheet: HTMLLinkElement | null;
    uuid: string;
    constructor() {
        this.stylesheet = null;
        this.uuid = uuidV4();
    }
    async load() {
        loadUI(this);
    }

    async init(...args: any[]) {}
    async destroy() {
        while (wrapper.hasChildNodes()) {
            wrapper.removeChild(wrapper.firstChild as ChildNode);
        }
        this.stylesheet?.remove();
    }
    loadStyleSheet(href: string) {
        const link = document.createElement('link');
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", href);
        this.stylesheet = link;
        document.head.append(link);
    }
}

export {
    UI,
    setActiveUI,
    getActiveUI,
    isUILoaded,
    loadUI,
    getMousePos,
    wrapper
};
