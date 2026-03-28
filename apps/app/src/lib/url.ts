export function extractPathname(url: string): string | null {
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
}

export function extractQuery(url: string): string | null {
  try {
    return new URL(url).search || null;
  } catch {
    return null;
  }
}
