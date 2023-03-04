const db = require("./src/models");
const Role = db.Role;
const PORT = 6000;

const app = require("./app");

db.sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    // initial();
    app.listen(PORT, function () {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.log(error));
const initial = () => {
  Role.create({
    id: 1,
    name: "user",
  });

  Role.create({
    id: 2,
    name: "moderator",
  });

  Role.create({
    id: 3,
    name: "admin",
  });
};
