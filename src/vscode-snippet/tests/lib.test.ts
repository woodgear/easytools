import { assert } from 'chai';
import { transform } from '../src/lib';

describe('test', () => {
    it('should ok', async () => {
        const snippet = `
describe("test", () => {
    it("should ok", async () => {
        
    })
})
`;
        const vscodeSnippet =
            '"",\n"describe(\\"test\\", () => {",\n"    it(\\"should ok\\", async () => {",\n"        ",\n"    })",\n"})",\n""';
        const result = transform(snippet);
        assert.equal(result, vscodeSnippet);
    });
});
