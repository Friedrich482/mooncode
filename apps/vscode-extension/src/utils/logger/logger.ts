const LOG_PREFIX = "[MoonCode]";

export const logInfo = (message: string) => {
  console.log(`${LOG_PREFIX} INFO: ${message}`);
};

export const logDir = (data: any) => {
  console.log(`${LOG_PREFIX} Data:`);
  console.dir(data, { depth: Infinity });
};

export const logError = (message: string) => {
  console.error(`${LOG_PREFIX} ERROR: ${message}`);
};
