import PocketBase from 'pocketbase';

const url = import.meta.env.VITE_POCKETBASE_URL;
if (!url) {
  console.error('[pocketbase] VITE_POCKETBASE_URL is not set');
} else {
  console.log('[pocketbase] connecting to', url);
}

const pb = new PocketBase(url);

export default pb;
