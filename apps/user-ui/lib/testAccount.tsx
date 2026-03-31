type UserRole = "user" | "merchant" | "admin" | null;

export const TEST_ACCOUNTS = {
  customer: {
    email: "vibhu@gmail.com",
    password: "Vikram12@",
    name: "Vibhu Gupta",
    role: "customer" as UserRole,
    kycApproved: false,
  },
  // verified_customer: {
  //   email: "try.vikram.kumar01@gmail.com",
  //   password: "Vikram12@",
  //   name: "Vikram kumar Verified",
  //   role: "customer" as UserRole,
  //   kycApproved: true,
  // },
  // merchant: {
  //   email: "admin@urbancoffee.com",
  //   password: "Password123",
  //   name: "Urban Coffee House",
  //   role: "merchant" as UserRole,
  //   kycApproved: true,
  // },
  // admin: {
  //   email: "admin@finewallet.com",
  //   password: "Password123",
  //   name: "System Admin",
  //   role: "admin" as UserRole,
  //   kycApproved: true,
  // },
};
