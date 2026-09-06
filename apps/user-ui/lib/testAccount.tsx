type UserRole = "user" | "merchant" | "admin" | null;

export const TEST_ACCOUNTS = {
  trial_user: {
    email: "try.vikram.kumar01@gmail.com",
    password: "Vikram12@",
    name: "Trial User",
    role: "customer" as UserRole,
    kycApproved: true,
  },
  customer: {
    email: "vibhu@gmail.com",
    password: "Vikram12@",
    name: "Vibhu Gupta",
    role: "customer" as UserRole,
    kycApproved: false,
  },
  verified_customer: {
    email: "try.vikram.kumar01@gmail.com",
    password: "Vikram12@",
    name: "Vikram kumar Verified",
    role: "customer" as UserRole,
    kycApproved: true,
  },
};
