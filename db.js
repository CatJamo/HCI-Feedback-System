const DB_CONFIG = {
  baseUrl: "http://127.0.0.1:5984",
  dbName: "hci_feedback",
  username: "admin",
  password: "admin"
};

function dbAuthHeader() {
  if (!DB_CONFIG.username || !DB_CONFIG.password) {
    return "";
  }
  const token = btoa(`${DB_CONFIG.username}:${DB_CONFIG.password}`);
  return `Basic ${token}`;
}

async function requestJson(url, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const auth = dbAuthHeader();
  if (auth) {
    headers.set("Authorization", auth);
  }
  const response = await fetch(url, { ...options, headers });
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  return { ok: response.ok, status: response.status, data };
}

async function ensureDb() {
  const url = `${DB_CONFIG.baseUrl}/${DB_CONFIG.dbName}`;
  let res = await requestJson(url, { method: "GET" });
  if (res.status === 404) {
    res = await requestJson(url, { method: "PUT" });
  }
  return res;
}

function dbUrl(path) {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${DB_CONFIG.baseUrl}/${DB_CONFIG.dbName}${safePath}`;
}

function generateId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}:${crypto.randomUUID()}`;
  }
  return `${prefix}:${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function dbGetDoc(id) {
  return requestJson(dbUrl(encodeURIComponent(id)), { method: "GET" });
}

async function dbPutDoc(doc) {
  const id = doc._id || generateId(doc.type || "doc");
  const payload = { ...doc, _id: id };
  return requestJson(dbUrl(encodeURIComponent(id)), {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

async function dbDeleteDoc(doc) {
  const id = encodeURIComponent(doc._id);
  return requestJson(dbUrl(`${id}?rev=${encodeURIComponent(doc._rev)}`), {
    method: "DELETE"
  });
}

async function dbFind(selector, sort, limit) {
  const body = { selector };
  if (sort) body.sort = sort;
  if (limit) body.limit = limit;
  return requestJson(dbUrl("_find"), {
    method: "POST",
    body: JSON.stringify(body)
  });
}

async function updateDoc(id, updater) {
  const current = await dbGetDoc(id);
  if (!current.ok) return current;
  const updated = updater({ ...current.data });
  return dbPutDoc(updated);
}

function readQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function getStoredJson(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

function setStoredJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
