import { read } from 'fs';
import mangaDisplay from './mangaDisplay'
import UIReader from './reader'
import {wait} from './utils'

const mangaid = 48045;

(async () => {
    // 989341
    // 1058800
    // d76b51b1ed12b37a797f6154f844cf46
    const reader = new UIReader("d76b51b1ed12b37a797f6154f844cf46");
    await reader.load();
    // setInterval(async () => {
    //     const mode = reader.readerMode;
    //     reader.setReaderMode(mode === "horizontal" ? "vertical": mode === "vertical" ? "webtoon" : "horizontal");
    // }, 5000);
})();