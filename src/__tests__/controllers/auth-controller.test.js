const { register } = require("../../controllers/auth-controller");

const db = require("../../models");
const User = db.User;

const mockRequest = (name, email, password) => {
  return {
    body: {
      name: name,
      email: email,
      password: password,
    },
  };
};

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("Register Route", () => {
  it("Should fail when input field(s) is missing ", async () => {
    expect.assertions(2);

    const res = mockResponse();
    const req = mockRequest();
    const next = mockNext;

    await register(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(
      Error("Input missing required field(s).")
    );
  });
});
