const supertest = require('supertest');
const app = require("../app.js");

const request = supertest(app);

describe("User controller test", () => {
    it('tests /user/setUserBio endpoints', async() => {
        await request.post("/user/bio")
        .send({
            "name": "user",
            "age": 20,
            "sex": "f"
        }).then((res) => {
            expect(res.status).toBe(200);
        });
    });
});