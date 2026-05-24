export function hasTokens(tokens: number, isAdmin: boolean): boolean {
  return isAdmin || tokens >= 1;
}

export function formatTokens(tokens: number, isAdmin: boolean): string {
  return isAdmin ? "∞" : String(tokens);
}
