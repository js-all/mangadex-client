import { ipcRenderer } from "electron";
import {
    FormattedManga,
    PartialChapters,
    Tag,
} from "mangadex-api/types/mangadex";
import codes from "./codes";
import { UI, wrapper } from "./ui";
import { generateDomFromDescription, wait } from "./utils";

export default class UIMangaDisplay extends UI {
    async init(mangaid: number) {
        this.loadStyleSheet("css/mangaDisplay.css");

        // create the dom used for this page
        wrapper.append(
            ...generateDomFromDescription(
                {
                    type: "div",
                    attributes: {
                        id: "background",
                    },
                    childs: [
                        {
                            type: "div",
                            attributes: {
                                id: "background-cover-image",
                            },
                        },
                    ],
                },
                {
                    type: "div",
                    attributes: {
                        id: "foreground",
                    },
                    childs: [
                        {
                            type: "div",
                            attributes: {
                                id: "header-container",
                            },
                            childs: [
                                {
                                    type: "div",
                                    attributes: {
                                        id: "cover-preview",
                                    },
                                },
                                {
                                    type: "div",
                                    attributes: {
                                        id: "manga-info-container",
                                    },
                                    childs: [
                                        {
                                            type: "div",
                                            attributes: {
                                                id:
                                                    "manga-info-title-id-wrapper",
                                            },
                                            childs: [
                                                {
                                                    type: "div",
                                                    attributes: {
                                                        id: "manga-info-title",
                                                        class:
                                                            "manga-info-item",
                                                    },
                                                    text: "loading...",
                                                },
                                                {
                                                    type: "div",
                                                    attributes: {
                                                        id: "manga-info-id",
                                                        class:
                                                            "manga-info-item",
                                                    },
                                                    text: "loading...",
                                                },
                                            ],
                                        },
                                        {
                                            type: "div",
                                            attributes: {
                                                id: "manga-info-credit",
                                                class: "manga-info-item",
                                            },
                                            text: "loading...",
                                        },
                                        {
                                            type: "div",
                                            attributes: {
                                                id: "manga-info-more",
                                                class: "manga-info-item",
                                            },
                                            childs: [
                                                {
                                                    type: "div",
                                                    attributes: {
                                                        id: "manga-info-status",
                                                        class:
                                                            "manga-info-item",
                                                    },
                                                    text: "loading...",
                                                },
                                                {
                                                    type: "div",
                                                    attributes: {
                                                        id:
                                                            "manga-info-chapters",
                                                        class:
                                                            "manga-info-item",
                                                    },
                                                    text: "loading...",
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            type: "div",
                            attributes: {
                                id: "description",
                                class: "closed",
                            },
                            text: "loading...",
                        },
                        {
                            type: "div",
                            attributes: {
                                id: "tags-wrapper",
                            },
                            text: "loading...",
                        },
                        {
                            type: "div",
                            attributes: {
                                id: "chapters-wrapper",
                            },
                            text: "loading...",
                        },
                    ],
                }
            )
        );

        const navContainer = document.querySelector(
            "#nav-container"
        ) as HTMLElement;
        const description = document.querySelector(
            "#description"
        ) as HTMLElement;
        const backgroundCoverImage = document.querySelector(
            "#background-cover-image"
        ) as HTMLElement;
        const chaptersWrapper = document.querySelector(
            "#chapters-wrapper"
        ) as HTMLElement;
        const headerContainer = document.querySelector(
            "#header-container"
        ) as HTMLElement;

        const onParalaxScroll = () => {
            // first part get and modify the navbar background opacity
            let navbarBGColor = getComputedStyle(navContainer).getPropertyValue(
                "background-color"
            );
            //change to rgba if not and remove spaces
            navbarBGColor = navbarBGColor
                .replace(/rgb(?=\()/g, "rgba")
                .replace(
                    /(\((?: *)(?:[0-9\. ]+,){2})([0-9\. ]+)(?= *\))/g,
                    "$1$2, 1.0"
                )
                .replace(/ /g, "");
            let alpha =
                ((wrapper.scrollTop * 2) / window.innerHeight) * 0.3 + 0.7;
            alpha > 1 && (alpha = 1);
            navbarBGColor = navbarBGColor.replace(
                /,(?:[0-9\.]+)(?=\))/g,
                `,${alpha}`
            );
            navContainer.style.backgroundColor = navbarBGColor;

            // second deals with paralax
            if (chaptersWrapper.childElementCount < 1) {
                // static if chapters haven't loaded yet
                backgroundCoverImage.style.top = `${wrapper.scrollTop}px`;
            } else {
                // the height of the chapter container + the offset of the chapter container relative to the top
                const fullHeight =
                    chaptersWrapper.getBoundingClientRect().height +
                    Math.abs(
                        chaptersWrapper.getBoundingClientRect().top -
                            headerContainer.getBoundingClientRect().top
                    );
                const imageHeight = backgroundCoverImage.getBoundingClientRect()
                    .height;
                backgroundCoverImage.style.top = `${
                    wrapper.scrollTop -
                    (wrapper.scrollTop /
                        (fullHeight - window.innerHeight) /
                        2) *
                        imageHeight
                }px`;
            }
        };
        onParalaxScroll();
        wrapper.addEventListener("scroll", onParalaxScroll);
        description.addEventListener("click", () => {
            description.classList.toggle("closed");
        });
        await wait(100);
        // here is the stuff that doesn't need to be fully done when the page is displayed
        (async () => {
            // check login
            await ipcRenderer.invoke("backend:Login");
            const manga: FormattedManga = await ipcRenderer.invoke(
                "mangadex:GetManga",
                mangaid
            );
            const getEl = (str: string) =>
                document.querySelector(str) as HTMLElement;

            backgroundCoverImage.style.setProperty(
                "--bg-image",
                `url("${manga.mainCover}")`
            );
            getEl("#cover-preview").style.setProperty(
                "--bg-image",
                `url("${manga.mainCover}")`
            );
            getEl("#manga-info-title").innerHTML = manga.title;
            getEl("#manga-info-id").innerHTML = "#" + manga.id;
            getEl("#manga-info-credit").innerHTML = [
                ...manga.author,
                ...manga.artist,
            ].join("<br />");
            getEl("#manga-info-status").innerHTML = codes.status(
                manga.publication.status
            );
            getEl("#description").innerHTML = manga.description
                .replace(/\n/g, "<br />")
                .replace(/\[url=(.+?)\]/g, '<a href="$1" target="_blank">')
                .replace(/\[\/url\]/g, "</a>")
                .replace(
                    /\[\*\]/g,
                    '<div class="nf description-icons"> </div>'
                )
                .replace(/\[/g, "<")
                .replace(/\]/g, ">");
            const chapters: PartialChapters = await ipcRenderer.invoke(
                "mangadex:GetMangaChapters",
                mangaid,
                "gb"
            );
            
            getEl("#manga-info-chapters").innerHTML =
                chapters.chapters.length + " chapters";
            chaptersWrapper.textContent = "";
            chapters.chapters.forEach(async (c, i) => {
                const chapterDiv = document.createElement("div");
                chapterDiv.classList.add("chapter-container");
                const chapterTitle = document.createElement("div");
                chapterTitle.classList.add("chapter-title");
                chapterTitle.innerHTML = `<span class="text-tertiary">ch.${Math.abs(
                    i - chapters.chapters.length
                )} - </span>${c.title}`;
                const chapterInfo = document.createElement("div");
                chapterInfo.classList.add("chapter-info");
                const chapterTimestamp = document.createElement("div");
                chapterTimestamp.classList.add("chapter-timestamp");
                chapterTimestamp.innerHTML = new Date(
                    c.timestamp * 1000
                ).toLocaleDateString();
                const chapterGroups = document.createElement("div");
                chapterGroups.classList.add("chapter-groups");
                chapterGroups.innerHTML = (await Promise.all(c.groups.map(codes.group))).map(v => v.name).join(', ');

                chapterInfo.append(chapterTimestamp, chapterGroups);
                chapterDiv.append(chapterTitle, chapterInfo);
                chaptersWrapper.append(chapterDiv);
            });
            const tags = (await Promise.all(
                manga.tags.map(async (c) => await codes.tag(c))
            )) as Tag[];
            const tagWrapper = getEl("#tags-wrapper");
            tagWrapper.innerHTML = "";
            tags.forEach((tag) => {
                const tagDiv = document.createElement("div");
                tagDiv.classList.add("tag-container");
                tagDiv.innerHTML = tag.name;
                tagWrapper.append(tagDiv);
            });
        })();
    }
};
