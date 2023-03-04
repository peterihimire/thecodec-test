const request = require("supertest");
const app = require("../../../app");

describe("Register Route", () => {
  // it("Post /", async () => {
  //   const res = await request(app)
  //     .post("/api/auth/register")
  //     .set("Content-Type", "application/json")
  //     .send({
  //       name: "Benkih Limited",
  //       email: "penkihiimire@gmail.com",
  //       password: "1234567",
  //     });

  //   expect(res.statusCode).toEqual(201);
  // });

  it("Post /", async () => {
    const res = await request(app).post("/api/auth/register").send({});

    expect(res.text).toEqual(
      '{"status":"Unsuccessful","msg":"Input missing required field(s)."}'
    );
    expect(res.statusCode).toEqual(422);
  });
});
