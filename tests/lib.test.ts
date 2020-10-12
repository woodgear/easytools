import { ping } from "../src/lib"

describe('lib test', () => {
    test("ping test", async () => {
        let res = await ping()
        expect(res).toEqual("pong")
    }, 1000 * 60 * 60)
})
