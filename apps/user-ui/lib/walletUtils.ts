export function getInitials(name: string | null | undefined): string {
  if (!name) return "";

  // 1. Trim whitespace and split into words, removing empty strings
  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 0) return "";

  // 2. If only one word (e.g., "Vikram" or "Amazon"), take first 2 letters
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  // 3. If multiple words, take first letter of First Name + first letter of Last Name
  const firstInitial = parts[0][0];
  const lastInitial = parts[parts.length - 1][0];

  return (firstInitial + lastInitial).toUpperCase();
}
