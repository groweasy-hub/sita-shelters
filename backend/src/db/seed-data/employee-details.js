/**
 * HR details for the seeded accounts, hand-synced from
 * frontend/src/lib/mock-data/employee-directory.js (see the note in
 * backend/src/permissions.js on why the packages don't share files).
 *
 * These accounts already carry these employee ids in the demo directory, so
 * the id generator must never hand them out again. `reportingManagerId` is
 * only set where that manager exists as a real account.
 */
export const EMPLOYEE_DETAILS = {
  "usr-arjun-rao": {
    employeeId: "EMP-1001",
    department: "Portfolio Office",
    joiningDate: "2019-04-01",
    mobile: "+91 98450 10001",
    reportingManagerId: null,
  },
  "usr-manoj-verma": {
    employeeId: "EMP-1010",
    department: "Project Management",
    joiningDate: "2020-01-20",
    mobile: "+91 98450 10010",
    reportingManagerId: null,
  },
  "usr-rahul-iyer": {
    employeeId: "EMP-1020",
    department: "Site Engineering",
    joiningDate: "2022-06-15",
    mobile: "+91 98450 10020",
    reportingManagerId: "usr-manoj-verma",
  },
  "usr-priyanka-das": {
    employeeId: "EMP-1030",
    department: "Stores & Inventory",
    joiningDate: "2021-11-10",
    mobile: "+91 98450 10030",
    reportingManagerId: "usr-manoj-verma",
  },
  "usr-alok-mishra": {
    employeeId: "EMP-1040",
    department: "Procurement",
    joiningDate: "2020-05-18",
    mobile: "+91 98450 10040",
    reportingManagerId: null,
  },
};
