import {
    Base64String,
    fixZipObj,
    ping,
    transformGbk,
    ZipFolderItem,
    zipObjToZip,
    zipToZipObj
} from '../src/lib';
import { assert, expect } from 'chai';

function toBase64String(str: string): Base64String {
    return Buffer.from(str).toString('base64');
}

describe('auxre-zip-decoder test', () => {
    it('ping test', async () => {
        const res = ping();
        expect(res).equal('pong');
    });

    it('test recover encoding', async () => {
        const origin = '2020.9.23 OKR椤甸潰娴忚UI璁捐';
        const expect = '2020.9.23 OKR页面浏览UI设计';
        const out = transformGbk(origin);
        assert.equal(expect, out);
    });

    it('test obj to zip', async () => {
        const mockZip = {
            items: [
                { name: 'xxx.txt', content: toBase64String('hello') },
                { name: 'xxx1.txt', content: toBase64String('hello2') },
                {
                    name: 'dir-1',
                    content: {
                        items: [
                            {
                                name: 'aaa.txt',
                                content: toBase64String('under dir-1')
                            },
                            {
                                name: 'bbb.txt',
                                content: toBase64String('under dir-1')
                            },

                            {
                                name: 'dir-2',
                                content: {
                                    items: [
                                        {
                                            name: 'ccc.txt',
                                            content: toBase64String(
                                                'under dir-2'
                                            )
                                        }
                                    ]
                                }
                            },
                            {
                                name: 'dir-3',
                                content: {
                                    items: [
                                        {
                                            name: 'ddd.txt',
                                            content: toBase64String(
                                                'under dir-3'
                                            )
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        };
        const zip = await zipObjToZip(mockZip);
        const zipObj = await zipToZipObj(zip);
        assert.deepEqual(zipObj, mockZip);
    });

    it('rename zip should ok', async () => {
        const mockZip = {
            items: [
                {
                    name: '2020.9.23 OKR椤甸潰娴忚UI璁捐',
                    content: toBase64String('hello')
                },
                {
                    name: 'dir-1',
                    content: {
                        items: [
                            {
                                name: 'OKR椤甸潰娴忚UI璁捐',
                                content: toBase64String('under dir-1')
                            },

                            {
                                name: 'dir-2',
                                content: {
                                    items: [
                                        {
                                            name: 'bbb.txt',
                                            content: toBase64String(
                                                'under dir-2'
                                            )
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        };
        fixZipObj(mockZip);

        const fixedZip = await zipObjToZip(mockZip);
        const obj = await zipToZipObj(fixedZip);
        assert.equal(obj.items[0].name, '2020.9.23 OKR页面浏览UI设计');
        assert.equal(
            (obj.items[1] as ZipFolderItem).content.items[0].name,
            'OKR页面浏览UI设计'
        );
    });
});
