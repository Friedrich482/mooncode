import { getExtensionContext } from "@/extension";

export const deleteToken = async () => {
  const context = getExtensionContext();

  await context.secrets.delete("authToken");
};
