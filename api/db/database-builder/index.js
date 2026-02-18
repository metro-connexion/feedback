import { buildAuthenticationMethod } from "./factory/build-authentication-method.js";
import { buildReport } from "./factory/build-report.js";
import { buildReportType } from "./factory/build-report-type.js";
import { buildUsers } from "./factory/build-users.js";

const databaseBuilder = {
  factory: {
    buildUsers,
    buildAuthenticationMethod,
    buildReportType,
    buildReport,
  },
};

export { databaseBuilder };
