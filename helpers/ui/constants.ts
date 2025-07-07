const Constants = {
  emailId: process.env.EMAIL_ID,
  password: process.env.PASSWORD,
  accountId: 1226026,
  agronEmailId: process.env.AGRON_EMAIL_ID,
  agronName: "Marc Arnusch",
  agronAccountId: 1227316,

  mirroredUser: {
    name: "Trevor Glaser",
    orgName: "Mid Valley Farms Inc.",
    accountNumber: "1070778",
    accountNumbers:
      "1070778, 1226026, 1747444, 1001364, 1070989, 1226024, 1039245, 103947, 1648367",
  },

  devices: {
    mobile: [411, 731],
    tablet: [1024, 768],
  },

  cropPlanUser: {
    accountNum: "1234",
    customerId: "1627739",
  },

  ecommPurModalUser: {
    name: "Dagwood Sandwich",
    email: process.env.ECOMMPURMODALUSER,
    password: process.env.ECOMMPURMODALPASSWORDx,
  },

  notificationsUser: {
    name: "Italian Beef",
    email: process.env.NOTIFICATIONS_USER_EMAIL_ID,
    password: process.env.PASSWORD,
    accountNo: "1025632",
  },

  ecommApplicationServicesUser: {
    name: "Ham Burger",
    email: process.env.APPLSERVICESUSERID,
    password: process.env.PASSWORD,
    accountNo: "1172384",
  },

  payCanUserId: process.env.PAY_CAN_USER_ID,
  firstEmailIdAccount: 10138343,
  canAccountNo: "10091182",

  contractsCanUserId: process.env.CONTRACTSCANUSERID,
  contractsCanPassword: process.env.CONTRACTSCANPASSWORD,
  contractsAccountNum: "10091182",
  contractNum: "20011857",

  licenseUserId: process.env.LICENSE_USER_ID,
  licenseUserName: "Cody Swinehart",
  licenseAccountNumber: "1226874",

  fabUserId: process.env.FAB_USER_ID,
  recentPurchUserId: process.env.RECENT_PURCH_USER_ID,

  timeout: 10000, // This should be a short timeout. accountsTimeout should be our longest timeout
  // please use these timeouts for everything instead of custom timeouts
  nutrienTinyTimeout: 100,
  nutrienShortTimeout: 1000,
  nutrienMediumTimeout: 4000,
  nutrienLongTimeout: 15000,
  nutrienMaxTimeout: 30000,
  nutrienExtendedMaxTimeout: 120000,

  // timeout: 10000, // remove this after finding all references and switching to nutrien timeouts
  ecommTimeout: 30000,
  pauseTime: 1000, // rename as short timeout
  accountsTimeout: 30000, // same as ecomm and agronomy timeouts, combine these

  dataLayer: {
    userID: "621852036569859201",
    customerID: "626752036569860701",
    minimumNotifs: 25,
    branchID: "101",
    branchName: "Tangent",
    account: 1001364,
    fmsAccount: 1002424,
  },
};

export default Constants
