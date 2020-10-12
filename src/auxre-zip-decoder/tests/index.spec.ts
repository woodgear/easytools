import { ping } from "../src/index"
import * as walkdir from "walkdir"
import * as iconv from "iconv-lite"
import * as fs from "fs-extra"
import * as path from "path"
import { assert } from "chai";

describe('auxre-zip-decoder test', () => {
    test("ping test", async () => {
        let res = ping()
        expect(res).toEqual("pong")
    })

    function transformGbk(origin: string): string {
        const str = iconv.encode(origin, 'GBK');
        const out = iconv.decode(Buffer.from(str), 'utf8');
        return out;
    }

    it("test recover encoding", async () => {
        const origin = "2020.9.23 OKR椤甸潰娴忚UI璁捐";
        const expect = "2020.9.23 OKR页面浏览UI设计"
        const out = transformGbk(origin);
        assert.equal(expect, out);
    });

    it.skip("test transform dir", async () => {
        let dirPath = "./1";
        dirPath = path.resolve(dirPath)
        console.log('dir', dirPath);
        const newDir = path.resolve("./2")

        for (const item of walkdir.sync(dirPath)) {
            if (fs.lstatSync(item).isDirectory()) {
                continue;
            }
            const transformedPath = transformGbk(item)
            const newPath = item.replace(dirPath, newDir);
            console.log(item, newPath);
            const content = fs.readFileSync(item);
            fs.outputFileSync(newPath, content)
        }
    })
})
