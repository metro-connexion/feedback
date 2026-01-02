import { buildAuthenticationMethod } from "./factory/build-authentication-method.js";
import { buildUsers } from "./factory/build-users.js";

const databaseBuilder = {
  factory: {
    buildUsers,
    buildAuthenticationMethod,
  },
};

export { databaseBuilder };
