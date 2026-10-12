import { store, json } from '../lib/common.mjs';
export default async () => {
  try {
    const d = await store().get('site', { type: 'json' });
    return d ? json(d) : json({}, 404);
  } catch (e) {
    return json({}, 404);
  }
};
export const config = { path: '/api/site-data' };
