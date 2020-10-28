import { ping } from "../src/lib"
import { expect } from "chai"
describe('lib test', () => {
    it("ping test", async () => {
        const res = await ping()
        expect(res).equal("pong")
    })
})
