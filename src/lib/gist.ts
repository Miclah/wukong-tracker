const GIST_FILENAME = 'wukong-tracker-share.txt';
const GIST_API = 'https://api.github.com/gists';

/** POST the encoded share string to a public anonymous GitHub Gist. Returns the gist ID. */
export async function createGist(encoded: string): Promise<string> {
  const res = await fetch(GIST_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github+json',
    },
    body: JSON.stringify({
      description: 'Wukong Tracker shared playthrough',
      public: true,
      files: { [GIST_FILENAME]: { content: encoded } },
    }),
  });
  if (!res.ok) throw new Error(`GitHub Gist API returned ${res.status}`);
  const data = await res.json() as { id: string };
  return data.id;
}

/** Fetch the encoded share string from a previously created gist. Returns null on failure. */
export async function fetchGist(id: string): Promise<string | null> {
  try {
    const res = await fetch(`${GIST_API}/${encodeURIComponent(id)}`, {
      headers: { 'Accept': 'application/vnd.github+json' },
    });
    if (!res.ok) return null;
    const data = await res.json() as { files: Record<string, { content: string }> };
    return data.files[GIST_FILENAME]?.content ?? null;
  } catch {
    return null;
  }
}
