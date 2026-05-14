const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;

function requireEnv() {
  if (!TOKEN || !OWNER || !REPO) {
    throw new Error(
      "Missing env vars: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO must all be set."
    );
  }
}

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function getFile<T>(path: string): Promise<{ data: T; sha: string }> {
  requireEnv();
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) throw new Error(`GitHub ${res.status} reading ${path}: ${await res.text()}`);
  const json = await res.json();
  const raw = Buffer.from(json.content.replace(/\n/g, ""), "base64").toString("utf8");
  return { data: JSON.parse(raw) as T, sha: json.sha };
}

export async function putFile(
  path: string,
  content: unknown,
  sha: string,
  message: string
): Promise<string> {
  requireEnv();
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString("base64");
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ message, content: encoded, sha }),
    }
  );
  if (!res.ok) throw new Error(`GitHub ${res.status} writing ${path}: ${await res.text()}`);
  const json = await res.json();
  return json.content.sha as string;
}

export async function triggerWorkflow(workflow: string, ref = "main"): Promise<void> {
  requireEnv();
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${workflow}/dispatches`,
    {
      method: "POST",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ ref }),
    }
  );
  if (!res.ok) throw new Error(`GitHub ${res.status} triggering workflow: ${await res.text()}`);
}
