import { Tag, TagResolver } from "mangadex-api";
import { ipcRenderer } from "electron";

let cachedTags: Map<number, Tag>;
const cacheMapWaitingQueue: Function[] =  [];

async function getTagsList() {
    // if cachhedTags is undefined, set it (async)
    if (!cachedTags) {
        cachedTags = new Map();
        // retreive the tags from the api
        ((await ipcRenderer.invoke("mangadex:GetTags")) as Tag[]).forEach(
            (v) => {
                cachedTags.set(v.id, v);
            }
        );
        // once its done let any other call (resolve their promise) of getTagsList continue with the newly set value of cachedTags
        cacheMapWaitingQueue.forEach(res => res())
    // if not undefined, but empty (while its being set by any other call of getTagsList)
    } else if (cachedTags.size === 0) {
        // wait until cahedTags has been set
        await new Promise<void>(res => cacheMapWaitingQueue.push(res));
    }
    return cachedTags;
}

export default {
    status(code: number) {
        return ["ongoing", "completed", "cancelled", "hiatus"][code - 1];
    },
    // async because it needs to ask the backend to make a request to the mangadex api to get the tags
    async tag(code: number) {
        return (await getTagsList()).get(code);
    },
};
