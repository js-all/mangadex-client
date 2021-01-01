import {FormattedManga} from 'mangadex-api'
import {ipcRenderer} from 'electron'

const mangaid = 48045;

(async () => {
    await ipcRenderer.invoke("backend:Login");
    console.log("backend logged in !");
    //const manga :FormattedManga = await ipcRenderer.invoke("mangadex:GetManga", mangaid);
    (<HTMLElement>document.querySelector("#background-cover-image")).style.setProperty("--bg-image", `url("${/*manga.mainCover*/"https://mangadex.org/images/manga/48045.jpg?1600620614"}")`);
    //const chapters = await ipcRenderer.invoke("mangadex:GetMangaChapters", mangaid);
    //console.log(manga, chapters)
})();
