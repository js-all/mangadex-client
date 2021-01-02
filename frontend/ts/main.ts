import {FormattedManga} from 'mangadex-api'
import {ipcRenderer} from 'electron'
import {setStyleEventListeners} from './style'

const mangaid = 48045;

(async () => {
    setStyleEventListeners();
    await ipcRenderer.invoke("backend:Login");
    console.log("backend logged in !");
    const manga :FormattedManga = await ipcRenderer.invoke("mangadex:GetManga", mangaid);
    (<HTMLElement>document.querySelector("#background-cover-image")).style.setProperty("--bg-image", `url("${manga.mainCover}")`);
    //const chapters = await ipcRenderer.invoke("mangadex:GetMangaChapters", mangaid);
    //console.log(manga, chapters)
})();
