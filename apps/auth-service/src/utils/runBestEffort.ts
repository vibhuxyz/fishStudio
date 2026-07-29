import { logger } from "@repo/libs/logger";

/**
 * Runs a non-critical side effect (notify, websocket event) without letting
 * its failure fail the main request.
 */
export const runBestEffort = async (label: string, task: () => Promise<void>) => {
  try {
    await task();
  } catch (err) {
    logger.error(label, err);
  }
};
