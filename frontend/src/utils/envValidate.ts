/**
 * Validates that all required environment variables are present and correctly formatted.
 * This runs at runtime to prevent application failures due to missing environment configuration.
 */

const REQUIRED_ENV_VARS = [
  'VITE_RPC_PROVIDER_URL',
  'VITE_SOVEREIGN_IDENTITY_REGISTRY_ADDRESS',
  'VITE_ACCESS_CONTROLLER_ADDRESS',
  'VITE_ENDORSEMENT_MANAGER_ADDRESS',
  'VITE_DAO_EXECUTOR_ADDRESS',
] as const;

export function validateEnvironment(): { success: boolean; missing: string[] } {
  const missing: string[] = [];

  REQUIRED_ENV_VARS.forEach((key) => {
    const val = import.meta.env[key];
    if (!val || val.trim() === '') {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error(
      `[Env Validation] Critical environment configuration error: Missing keys:`,
      missing
    );
  }

  return {
    success: missing.length === 0,
    missing,
  };
}
