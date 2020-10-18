import { Base64String, fixZipObj, ping, transformGbk, ZipFolderItem, ZipObj, zipObjToZip, zipToZipObj } from "../src/lib"
import * as walkdir from "walkdir"
import * as fs from "fs-extra"
import * as path from "path"
import { assert } from "chai";

function toBase64String(str: string): Base64String {
    return Buffer.from(str).toString("base64");
}




describe('auxre-zip-decoder test', () => {
    test("ping test", async () => {
        let res = ping()
        expect(res).toEqual("pong")
    })

    it("test recover encoding", async () => {
        const origin = "2020.9.23 OKR椤甸潰娴忚UI璁捐";
        const expect = "2020.9.23 OKR页面浏览UI设计"
        const out = transformGbk(origin);
        assert.equal(expect, out);
    });

    it("test obj to zip", async () => {
        const mockzip = {
            items: [
                { name: "xxx.txt", content: toBase64String("hello") },
                { name: "xxx1.txt", content: toBase64String("hello2") },
                {
                    name: "dir-1", content: {
                        items: [
                            { name: "aaa.txt", content: toBase64String("under dir-1") },
                            { name: "bbb.txt", content: toBase64String("under dir-1") },

                            {
                                name: "dir-2", content: {
                                    items: [
                                        { name: "ccc.txt", content: toBase64String("under dir-2") },

                                    ]
                                }
                            },
                            {
                                name: "dir-3", content: {
                                    items: [
                                        { name: "ddd.txt", content: toBase64String("under dir-3") },

                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        }
        const zip = await zipObjToZip(mockzip);
        const zipObj = await zipToZipObj(zip);
        assert.deepEqual(zipObj, mockzip)
    })



    it("rename zip should ok", async () => {
        const mockZip = {
            items: [
                { name: "2020.9.23 OKR椤甸潰娴忚UI璁捐", content: toBase64String("hello") },
                {
                    name: "dir-1", content: {
                        items: [
                            { name: "OKR椤甸潰娴忚UI璁捐", content: toBase64String("under dir-1") },

                            {
                                name: "dir-2", content: {
                                    items: [
                                        { name: "bbb.txt", content: toBase64String("under dir-2") },

                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        }
        fixZipObj(mockZip);

        const fixedZip = await zipObjToZip(mockZip);
        const obj = await zipToZipObj(fixedZip);
        assert.equal(obj.items[0].name, "2020.9.23 OKR页面浏览UI设计");
        assert.equal((obj.items[1] as ZipFolderItem).content.items[0].name, "OKR页面浏览UI设计");
    });
})
