import {FormattedManga, PartialChapters, Tag} from 'mangadex-api'
import {ipcRenderer} from 'electron'
import {setStyleEventListeners} from './style'
import codes from './codes'

const mangaid = 48045;

(async () => {
    setStyleEventListeners();
    await ipcRenderer.invoke("backend:Login");
    const manga :FormattedManga = await ipcRenderer.invoke("mangadex:GetManga", mangaid);
    const getEl = (str: string) => document.querySelector(str) as HTMLElement;
    getEl("#background-cover-image").style.setProperty("--bg-image", `url("${manga.mainCover}")`);
    getEl("#cover-preview").style.setProperty("--bg-image", `url("${manga.mainCover}")`);
    getEl("#manga-info-title").innerHTML = manga.title;
    getEl("#manga-info-id").innerHTML = "#"+ manga.id;
    getEl("#manga-info-credit").innerHTML = [...manga.author, ...manga.artist].join('<br />');
    getEl("#manga-info-status").innerHTML = codes.status(manga.publication.status);
    getEl("#description").innerHTML = manga.description.replace(/\n/g, "<br />").replace(/\[url=(.+?)\]/g, "<a href=\"$1\" target=\"_blank\">").replace(/\[\/url\]/g, "</a>").replace(/\[\*\]/g, "<div class=\"nf description-icons\"> </div>").replace(/\[/g, "<").replace(/\]/g, ">");
    const chapters :PartialChapters = await ipcRenderer.invoke("mangadex:GetMangaChapters", mangaid, "gb");
    getEl("#manga-info-chapters").innerHTML = chapters.chapters.length + " chapters";
    const chaptersWrapper = getEl('#chapters-wrapper');
    chapters.chapters.reverse().forEach((c, i) => {
        const chapterDiv = document.createElement('div')
        chapterDiv.classList.add('chapter-container');
        const chapterTitle = document.createElement('div');
        chapterTitle.classList.add('chapter-title');
        chapterTitle.innerHTML = `<span class="text-tertiary">${i} - </span>${c.title}`;
        const chapterInfo = document.createElement('div');
        chapterInfo.classList.add('chapter-info');
        const chapterTimestamp = document.createElement('div');
        chapterTimestamp.classList.add('chapter-timestamp');
        chapterTimestamp.innerHTML = new Date(c.timestamp * 1000).toLocaleDateString();
        const chapterGroups = document.createElement('div');
        chapterGroups.classList.add('chapter-groups');
        chapterGroups.innerHTML = "wip"

        chapterInfo.append(chapterTimestamp, chapterGroups);
        chapterDiv.append(chapterTitle, chapterInfo);
        chaptersWrapper.append(chapterDiv);
    });
    const tags = (await Promise.all(manga.tags.map(async c => await codes.tag(c)))) as Tag[];
    const tagWrapper = getEl("#tags-wrapper");
    tagWrapper.innerHTML = "";
    tags.forEach(tag => {
        const tagDiv = document.createElement('div');
        tagDiv.classList.add("tag-container")
        tagDiv.innerHTML = tag.name;
        tagWrapper.append(tagDiv);
    });
})();