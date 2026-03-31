export class Currency {
  /**
   * Convert rupees to paise (₹100.50 -> 10050)
   */

  static toPaise(rupees: string | number): bigint {
    const amount = typeof rupees === "string" ? parseFloat(rupees) : rupees;
    if (isNaN(amount)) throw Error("Invalid amount");
    if (amount < 0) throw new Error("Amount cannot be negative");
    const paise = Math.round(amount * 100);
    return BigInt(paise);
  }

  static toRupees(paise: bigint | string | number): string {
    const paiseNum = typeof paise === "bigint" ? paise : BigInt(paise);
    const rupees = Number(paiseNum) / 100;
    return rupees.toFixed(2);
  }

  /**
   * Format for display (10050 -> "₹100.50")
   */

  static format(paise: bigint | string | number): string {
    return `₹${this.toRupees(paise)}`;
  }

  /**
   * Validate amount is within range (in paise)
   */
  static validate(paise: bigint, min: bigint, max: bigint): boolean {
    return paise >= min && paise <= max;
  }

  static add(a: bigint, b: bigint): bigint {
    return a + b;
  }

  static subtract(a: bigint, b: bigint): bigint {
    if (a < b) throw new Error("Insufficient balance");
    return a - b;
  }

  static percentage(amount: bigint, percent: number): bigint {
    const result = (amount * BigInt(Math.round(percent * 100))) / BigInt(10000);
    return result;
  }
}
