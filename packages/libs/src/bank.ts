export function generateIfscCode(bankName: string): string {
  // Bank code mapping (first 4 letters)
  const bankCodes: Record<string, string> = {
    "State Bank of India": "SBIN",
    "HDFC Bank": "HDFC",
    "ICICI Bank": "ICIC",
    "Axis Bank": "UTIB", // Axis uses UTIB code
    "Kotak Mahindra Bank": "KKBK",
    "Punjab National Bank": "PUNB",
    "Bank of Baroda": "BARB",
    "Canara Bank": "CNRB",
    "Union Bank of India": "UBIN",
    "Indian Bank": "IDIB",
  };

  // Get bank code (default to first 4 letters if not in map)
  let bankCode = bankCodes[bankName];
  if (!bankCode) {
    bankCode = bankName
      .replace(/[^A-Z]/g, "")
      .substring(0, 4)
      .toUpperCase()
      .padEnd(4, "X");
  }

  // Generate random 6-character branch code (uppercase letters and numbers)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let branchCode = "";
  for (let i = 0; i < 6; i++) {
    branchCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Format: XXXX0XXXXXX (4 letters + 0 + 6 alphanumeric)
  return `${bankCode}0${branchCode}`;
}

export function generateAccountNumber(): string {
  const length = 14; // Standard bank account number length
  let accountNumber = "";

  // First digit should not be 0
  accountNumber += Math.floor(Math.random() * 9) + 1;

  // Rest of the digits
  for (let i = 1; i < length; i++) {
    accountNumber += Math.floor(Math.random() * 10);
  }

  return accountNumber;
}

export function generateBranchName() {
  const branches = [
    "Main Branch",
    "Central Branch",
    "City Center",
    "Commercial Street",
    "Market Road",
    "Electronic City",
    "Whitefield",
    "Koramangala",
    "Indiranagar",
    "Jayanagar",
  ];

  return branches[Math.floor(Math.random() * branches.length)];
}


