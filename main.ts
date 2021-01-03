import { app, BrowserWindow, ipcMain } from "electron";
import { Mangadex, MRequestOptions, SearchQuery } from "mangadex-api";
import fs from "fs";
import path from "path";
import { PartialChaptersParams } from "mangadex-api/dist/api/base";

let loggedIn = false;
const client = new Mangadex();

function createWindow() {
    const win = new BrowserWindow({
        width: 600,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
        },
        frame: false,
    });
    win.loadFile("./frontend/index.html");
    win.webContents.on('new-window', function(e, url) {
        e.preventDefault();
        require('electron').shell.openExternal(url);
      });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
ipcMain.handle("backend:Login", async () => {
    if(loggedIn) return true;
    if (fs.existsSync(path.join(__dirname, "/session"))) {
        await client.agent.loginWithSession(path.join(__dirname, "/session"));
    } else {
        if (fs.existsSync(path.join(__dirname, "/credentials"))) {
            const credentials = fs
                .readFileSync(path.join(__dirname, "/credentials"))
                .toString()
                .replace(/\r/g, "")
                .split("\n");
            if (credentials.length < 2)
                throw new Error("credentials formated incorectly");
            if (!(await client.agent.login(credentials[0], credentials[1]))) {
                throw new Error("login failed (invalid credentials ?)");
            } else {
                await client.agent.saveSession(
                    path.join(__dirname, "/session")
                );
            }
        } else {
            fs.writeFileSync(
                path.join(__dirname, "/credentials"),
                "username here\npassword there"
            );
            throw new Error(
                "No credentials found, please edit credentials with an account username on the first line and the password on the second"
            );
        }
    }
    loggedIn = true;
    return true;
});
ipcMain.handle(
    "mangadex:GetChapter",
    async (event, chapterid: number) => {
        return await client.chapter.getChapter(chapterid);
    }
);

ipcMain.handle(
    "mangadex:GetGroup",
    async (event, groupid: number) => {
        return await client.group.getGroup(groupid);
    }
);

ipcMain.handle(
    "mangadex:Search",
    async (event, query: string | SearchQuery) => {
        return await client.search(query);
    }
);

ipcMain.handle(
    "mangadex:GetManga",
    async (event, id: number) => {
        return await client.manga.getManga(id);
    }
);

ipcMain.handle(
    "mangadex:GetMangaCover",
    async (event, id: number) => {
        return await client.manga.getMangaCovers(id);
    }
);

ipcMain.handle(
    "mangadex:GetTags",
    async(event) => {
        return await client.tag.getTags();
    }
);

ipcMain.handle(
    "mangadex:GetMangaChapters",
    async (event, id: number, filterByLanguage?: string) => {
        const res = await client.manga.getMangaChapters(id);
        if(filterByLanguage) {
            res.chapters = res.chapters.filter(c => c.language === filterByLanguage);
            res.groups = res.groups.filter(g => g.language === filterByLanguage);
        }
        return res;
    }
);