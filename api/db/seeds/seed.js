import * as seedUsers from "./data/users.js";

function _addSeparation() {
  return console.log("-----------------------");
}

async function seed() {
  console.log("Start seeding...");
  _addSeparation();
  console.log("Seeding users...");
  await seedUsers.createBasicUser();
  await seedUsers.createNotActiveUser();
  _addSeparation();
  console.log("Seeding complete!");
}

export { seed };
