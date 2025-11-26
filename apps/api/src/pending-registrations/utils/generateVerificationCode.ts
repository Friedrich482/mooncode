const generateVerificationCode = () => {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // No 0,O,1,I,L
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export default generateVerificationCode;
