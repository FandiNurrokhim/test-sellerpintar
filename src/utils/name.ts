export function splitFullName(fullName: string) {
  const firstName = fullName.trim().split(" ")[0];
  const lastName = fullName.trim().slice(firstName.length).trim();
  return { firstName, lastName };
}
