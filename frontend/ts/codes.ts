import { Group, Tag } from "mangadex-api";
import { ipcRenderer } from "electron";

let cachedTags: Map<number, Tag>;
const cacheTagMapWaitingQueue: Function[] =  [];
const cachedGroups: Map<number, Group> = new Map();
const cachedGroupsWaitingQueue: Map<number, Set<(group: Group) => any>> = new Map();

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
        cacheTagMapWaitingQueue.forEach(res => res())
    // if not undefined, but empty (while its being set by any other call of getTagsList)
    } else if (cachedTags.size === 0) {
        // wait until cahedTags has been set
        await new Promise<void>(res => cacheTagMapWaitingQueue.push(res));
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
    async group(code: number) {
        // if its already been cached
        if(cachedGroups.has(code)) {
            // just get it from the already cached data
            return cachedGroups.get(code) as Group;
        // if its being cached
        } else if(cachedGroupsWaitingQueue.has(code)) {
            // wait until the data has been cached and return it
            return await new Promise<Group>(res => cachedGroupsWaitingQueue.get(code)?.add(res));
        // if it has never been cached
        } else {
            // say that its being cached and provide a set or promises to be resolved with the data once its done
            cachedGroupsWaitingQueue.set(code, new Set());
            // wait to avoid sending many request fast (doesn't do much here as this part of the function will at most be called ~3 times)
            await new Promise(res => setTimeout(res, 100))
            const group =  await ipcRenderer.invoke("mangadex:GetGroup", code) as Group;
            // cache the data for later
            cachedGroups.set(code, group);
            // resolve the promises for the calls in between
            cachedGroupsWaitingQueue.get(code)?.forEach(v => v(group));
            return group;
        }
    }
};
