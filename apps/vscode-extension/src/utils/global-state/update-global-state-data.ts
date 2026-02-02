import { SYNC_DATA_KEY } from "@/constants";
import { getExtensionContext } from "@/extension";
import { GlobalStateData } from "@/types-schemas";

/**
 * This function is a wrapper around `vscode.context.globalState.update(key)`
 * Don't call `vscode.context.globalState.update(key)` to update the global state data, only use this function
 * @param data `GlobalStateData`
 */
export const updateGlobalStateData = async (data: GlobalStateData) => {
  const context = getExtensionContext();
  await context.globalState.update(SYNC_DATA_KEY, data);
};
