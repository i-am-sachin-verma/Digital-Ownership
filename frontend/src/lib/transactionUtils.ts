export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000, // 1 second
};

export const isRecoverableError = (error: any): boolean => {
  const message = (error?.message || error?.reason || "").toLowerCase();
  // Categorize errors: Network, Timeout, or Busy RPC are recoverable
  return (
    message.includes("timeout") ||
    message.includes("network") ||
    message.includes("rate limit") ||
    message.includes("429") ||
    message.includes("50")
  );
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = RETRY_CONFIG.MAX_RETRIES,
  delay = RETRY_CONFIG.INITIAL_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && isRecoverableError(error)) {
      console.warn(`Transaction failed, retrying in ${delay}ms...`, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2); // Exponential backoff
    }
    throw error;
  }
}