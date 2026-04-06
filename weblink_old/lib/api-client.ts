const API_BASE = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://valetvaultdev.24livehost.com/api/v2/weblink";

export { API_BASE };

export async function apiClient<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  const json = await res.json() as { status: boolean; message: string; data: T };
  if (!json.status) throw new Error(json.message ?? "API returned error");
  return json.data;
}
