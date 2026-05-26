export function hasTokens(tokens: number, isAdmin: boolean, count = 1): boolean {
  return isAdmin || tokens >= count;
}

export function formatTokens(tokens: number, isAdmin: boolean): string {
  return isAdmin ? "∞" : String(tokens);
}
