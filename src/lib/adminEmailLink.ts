const authOrigin = 'https://zwjzlzyqsqxqtjxhgmbs.supabase.co';
const emailTypes = ['signup', 'invite', 'magiclink', 'recovery', 'email'] as const;
export function parseAdminEmailLink(value: string) {
  const url = new URL(value.trim());
  const type = url.searchParams.get('type');
  const token = url.searchParams.get('token') ?? url.searchParams.get('token_hash');
  if (url.origin !== authOrigin || url.pathname !== '/auth/v1/verify' || url.username || url.password ||
    !emailTypes.some(allowed => allowed === type) || !token || token.length < 20 || token.length > 256) {
    throw new Error('Invalid activation link');
  }
  return { token_hash: token, type: type as typeof emailTypes[number] };
}
