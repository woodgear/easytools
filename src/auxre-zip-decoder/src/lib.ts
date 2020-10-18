import * as iconv from "iconv-lite"
import JSZip = require("jszip");

export function ping(): string {
    return "pong"
}

export function transformGbk(origin: string): string {
    const str = iconv.encode(origin, 'GBK');
    const out = iconv.decode(Buffer.from(str), 'utf8');
    return out;
}

// data struct represent a zip file
export interface ZipObj {
    items: (ZipFileItem | ZipFolderItem)[];
}

export type ZipFileItem = { name: string, content: Base64String }
export type ZipFolderItem = { name: string, content: ZipObj };
export type ZipItem = ZipFileItem | ZipFolderItem;
export type Base64String = string;

function isZipFolderItem(zipItem: ZipItem): zipItem is ZipFolderItem {
    return !(typeof zipItem.content === "string");
}

export async function zipToZipObj(zipFile: Base64String): Promise<ZipObj> {

    const zip = new JSZip();
    await zip.loadAsync(zipFile, { base64: true })
    const zipObj: ZipObj = { items: [] };
    // use this cache to access nested object in zipObj
    const zipObjDirCache: { [name: string]: ZipObj } = { "": zipObj };
    const files: ([string, JSZip.JSZipObject])[] = [];

    zip.forEach((path, file) => {
        files.push([path, file])
    });
    for (let [path, file] of files) {
        console.log('fix path', path, file.dir);
        if (file.dir) {
            path = path.slice(0, -1)
            console.assert(!!!zipObjDirCache[path], "zipObjDirCache should only be access once");
            // if file is dir path should be aa/xxx/ we need to remove the end of /
            const paths = path.split("/");
            const dirName = paths.pop();
            const parentPath = paths.length === 0 ? "" : paths.join("/");
            zipObjDirCache[path] = { items: [] }
            zipObjDirCache[parentPath].items.push({ name: dirName, content: zipObjDirCache[path] });
        } else {
            if (path.startsWith("__MACOSX")) {
                continue;
            }
            const paths = path.split("/");
            const fileName = paths.pop();
            const dirPath = paths.length === 0 ? "" : paths.join("/");
            //TODO 当路径中有斜杠时会出问题
            const content = await file.async("base64");
            zipObjDirCache[dirPath].items.push({ name: fileName, content });
        }
    }
    return zipObj;
}

export async function zipObjToZip(zipObj: ZipObj): Promise<Base64String> {
    const zip = new JSZip();
    buildZip(zip, zipObj);
    return (await zip.generateAsync({ type: "base64" })) as Base64String;

    function buildZip(zip: JSZip, zipObj: ZipObj) {
        for (const zipItem of zipObj.items) {
            if (isZipFolderItem(zipItem)) {
                buildZip(zip.folder(zipItem.name), zipItem.content);
            } else {
                zip.file(zipItem.name, zipItem.content, { base64: true, binary: true });
            }
        }
    }
}

function fixEncode(origin: string): string {
    return transformGbk(origin);
}

// TODO when should we fixEncode?
export function fixZipObj(zipObj: ZipObj) {
    for (const item of zipObj.items) {
        if (isZipFolderItem(item)) {
            // item.name = fixEncode(item.name);
            fixZipObj(item.content)
        } else {
            // item.name = fixEncode(item.name);
        }
    }
    return zipObj;
}
