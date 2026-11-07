import { getUniqueCount, json, toStatus } from './_lib/scans.js';

/** GET /api/status → { currentScans, target: 15, isOverloaded } */
export async function GET(): Promise<Response> {
  try {
    return json(toStatus(await getUniqueCount()));
  } catch (err) {
    console.error('[api/status]', err);
    return json({ error: 'status_unavailable' }, 503);
  }
}
