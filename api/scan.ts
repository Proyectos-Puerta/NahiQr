import { clientIp, getUniqueCount, hashIp, json, registerScan, toStatus } from './_lib/scans.js';
import type { ScanPayload } from './_lib/scans.js';

/** POST /api/scan → logs this visitor once (by hashed IP) and returns the updated status. */
export async function POST(request: Request): Promise<Response> {
  try {
    const ip = clientIp(request);
    // Without an IP every unknown visitor would collapse into one hash, so don't count it.
    const recorded = ip ? await registerScan(hashIp(ip)) : false;
    const payload: ScanPayload = { ...toStatus(await getUniqueCount()), recorded };
    return json(payload);
  } catch (err) {
    console.error('[api/scan]', err);
    return json({ error: 'scan_unavailable' }, 503);
  }
}
