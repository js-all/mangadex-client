import { ipcRenderer } from "electron";
import { Chapter } from "mangadex-api/types/mangadex";
import codes from "./codes";
import { isUILoaded, UI, wrapper } from "./ui";
import { generateDomFromDescription } from "./utils";

type ReaderMode = "webtoon" | "horizontal" | "vertical";

export default class UIReader extends UI {
    readerMode: ReaderMode = "horizontal";
    chapter: string | number;
    toUpdate: Function[] = [];
    constructor(chapter: string | number, readerMode?: ReaderMode) {
        super();
        this.chapter = chapter;
        if (readerMode) this.setReaderMode(readerMode);
    }
    async init() {
        this.loadStyleSheet("css/reader.css");

        wrapper.append(
            ...generateDomFromDescription({
                type: "div",
                attributes: {
                    id: "page-wrapper",
                },
            })
        );

        const ch = (await ipcRenderer.invoke(
            "mangadex:GetChapter",
            this.chapter
        )) as Chapter;
        const pageWrapper = document.querySelector(
            "#page-wrapper"
        ) as HTMLElement;
        const limitRatios: { ratio: number; element: HTMLElement }[] = [];

        const resizeHandler = () => {
            const pageRatio =
                (window.innerHeight - 50) /
                pageWrapper.getBoundingClientRect().width;
            pageWrapper.style.removeProperty("width");
            limitRatios.forEach((v) =>
                v.element.style.removeProperty("height")
            );
            if (this.readerMode === "horizontal") {
                pageWrapper.style.width =
                    (wrapper.getBoundingClientRect().width - 5) *
                        ch.pages.length +
                    "px";
            } else {
                limitRatios.forEach((v) => {
                    if (pageRatio > v.ratio || this.readerMode === "webtoon") {
                        v.element.style.height = `${
                            v.ratio * v.element.getBoundingClientRect().width
                        }px`;
                    } else {
                        v.element.style.removeProperty("height");
                    }
                });
            }
        };
        wrapper.addEventListener("click", (e) => {
            const totalWidth = wrapper.getBoundingClientRect().width;
            const actualPage = parseFloat(
                pageWrapper.style.getPropertyValue("--page")
            ) || 0;
            // right
            if (e.clientX > totalWidth / 2) {
                if(actualPage >= ch.pages.length-1) return;
                pageWrapper.style.setProperty(
                    "--page",
                    `${actualPage + 1}`
                );
                // left
            } else if(actualPage >= 1) {
                pageWrapper.style.setProperty(
                    "--page",
                    `${actualPage - 1}`
                );
            }
        });
        this.toUpdate.push(resizeHandler, () => {
            while (pageWrapper.classList.length > 0) {
                pageWrapper.classList.remove(
                    Array.from(pageWrapper.classList.values())[0]
                );
            }
            pageWrapper.classList.add(this.readerMode);
            pageWrapper.style.setProperty(
                "--page-vertical-gap",
                `${this.readerMode === "webtoon" ? 0 : 5}px`
            );
        });

        ch.pages.forEach((p) => {
            const pageElement = document.createElement("div");
            pageElement.classList.add("page");
            pageElement.style.backgroundImage = `url("${p}")`;
            const img = new Image();
            img.src = p;
            const ratio = img.height / img.width;
            limitRatios.push({
                ratio: ratio,
                element: pageElement,
            });
            pageWrapper.append(pageElement);
        });
        this.toUpdate.forEach((v) => v.bind(this)());
        window.addEventListener("resize", resizeHandler);
    }
    setReaderMode(mode: ReaderMode) {
        this.readerMode = mode;
        if (isUILoaded(this)) {
            this.toUpdate.forEach((v) => v.bind(this)());
        }
    }
}
