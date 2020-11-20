import * as fs from 'fs-extra';
import {
    fixZipObj,
    zipObjToZip,
    zipToZipObj
} from './auxre-zip-decoder/src/lib';
import rename from 'node-rename-path';

async function fixZip(originPath: string, newPath: string) {
    if (!fs.existsSync(originPath)) {
        console.error(`could not find ${originPath}`);
        return -1;
    }
    const rawZip = await fs.readFile(originPath, 'base64');
    const zipObj = await zipToZipObj(rawZip);
    const fixedZipObj = fixZipObj(zipObj);
    const fixedRawZip = await zipObjToZip(fixedZipObj);
    await fs.writeFileSync(newPath, fixedRawZip, 'base64');
}

async function main() {
    const originPath = process.argv[2];
    console.log('start fix encoding of', originPath);
    const newPath = rename(originPath, (pathObj) => {
        return { name: `${pathObj.name}.fixed` };
    });
    await fixZip(originPath, newPath);
    console.log('end fix encoding new path is', originPath);
}

main();
