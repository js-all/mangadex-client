interface ElementDescription {
    type: string;
    attributes: {
        [attribute: string]: string;
    };
    childs?: ElementDescription[];
    text?: string;
}

function generateElFromDescription(eldescr: ElementDescription) {
    const el = document.createElement(eldescr.type);
    for (let attr in eldescr.attributes) {
        el.setAttribute(attr, eldescr.attributes[attr]);
    }
    if (eldescr.text) el.textContent = eldescr.text;
    if (eldescr.childs) {
        for (let child of eldescr.childs) {
            el.append(generateElFromDescription(child));
        }
    }
    return el;
}

function setStyleSheet(href: string) {
    document.querySelector("link.loaded-stylesheet")?.remove();
    const link = document.createElement("link");
    link.setAttribute("href", href);
    link.setAttribute("rel", "stylesheet");
    link.classList.add("loaded-stylesheet");
    document.head.append(link);
}

function generateDomFromDescription(...domDescriptions: ElementDescription[]) {
    return domDescriptions.map(generateElFromDescription);
}

async function transition(cb: Function) {
    const waitNextAnimationFrame = () => {
        return new Promise((res) => requestAnimationFrame(res));
    };
    const transitionElement = generateElFromDescription({
        type: "div",
        attributes: {
            id: "transition",
        },
        childs: [
            {
                type: "div",
                attributes: {
                    class: "transition-loading-dot"
                },
            },
        ],
    });
    document.body.append(transitionElement);
    // wait next animation frame to be sure that css does the transition
    await waitNextAnimationFrame();
    await waitNextAnimationFrame();
    transitionElement.style.left = "0";
    // wait for the transition to be done
    await wait(500)
    await cb();
    await wait(100)
    await waitNextAnimationFrame();
    transitionElement.style.left = "-100vh";
    requestAnimationFrame(() => {
        setTimeout(() => {
            document.body.removeChild(transitionElement);
        }, 500);
    });
}
async function wait(delay:number) {
    await new Promise(res => setTimeout(res, delay));
}

export {
    generateDomFromDescription,
    ElementDescription,
    setStyleSheet,
    transition,
    wait
};
