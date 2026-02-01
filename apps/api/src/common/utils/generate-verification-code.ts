export const generateVerificationCode = (): string => {
  const chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // No 0,O,1,I,L (confusing characters)
  const randomBytes = new Uint8Array(8);
  crypto.getRandomValues(randomBytes);
  let code = "";

  for (let i = 0; i < 8; i++) {
    code += chars[randomBytes[i] % chars.length];
  }

  return code;
};
