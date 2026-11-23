(() => {
  "use strict";
  const SUPABASE_URL = "https://qkexfgadhtnkgzdfbcnf.supabase.co";
  // Publishable key: safe for browser use when Row Level Security is enabled.
  // Never place a Supabase service-role or secret key in this file.
  const PUBLISHABLE_KEY = "sb_publishable_1PvhkF6IY3Ls3jsE7zF7Aw_yKCLg1h-";
  const PUBLIC_API = SUPABASE_URL + "/functions/v1/profile-public-api";
  const headers = {
    apikey: PUBLISHABLE_KEY,
    Authorization: "Bearer " + PUBLISHABLE_KEY
  };

  async function readTable(path) {
    if (typeof path !== "string" || !/^[a-z0-9_?=.,&%-]+$/i.test(path)) {
      throw new Error("Permintaan data tidak valid.");
    }
    const response = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
      method: "GET",
      headers,
      cache: "no-store",
      credentials: "omit"
    });
    if (!response.ok) throw new Error("Data belum dapat dimuat.");
    return response.json();
  }

  async function sendPublic(payload) {
    const response = await fetch(PUBLIC_API, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "omit"
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Pengiriman belum berhasil. Coba lagi nanti.");
    return result;
  }

  window.ProfileBackend = Object.freeze({
    readTable,
    sendPublic
  });
})();