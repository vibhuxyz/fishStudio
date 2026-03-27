/**
 * Retries a function with exponential backoff.
 * 
 * @param fn The async function to retry.
 * @param options Configuration for retries.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
  }
): Promise<T> {
  let attempt = 0;
  
  while (attempt < options.maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= options.maxAttempts) {
        throw error;
      }
      
      const delay = Math.min(
        options.initialDelayMs * Math.pow(2, attempt - 1),
        options.maxDelayMs
      );
      
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  
  throw new Error("Retry failed after maximum attempts");
}
