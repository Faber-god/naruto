'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');
const crypto = require('crypto');
const { spawn } = require('child_process');

const PORTAL_HOST = 'naruto.narutowebgame.com';
const PORTAL_PATH = '/pt/serverlist/s';
const PORTAL_QUERY = 'leftbar_collapse=yes&logintype=4&landing_position=new_gamebox_v3.';
const COOKIE_SUFFIXES = ['narutowebgame.com', 'oasgames.com'];
const SKIP_INJECTION = new Set(['imsdk_param_login']);
const CHROMIUM_EPOCH_OFFSET_SECONDS = 11644473600;
const GAME_HOST_RE = /^(?:s[1-9][0-9]*-naruto(?:pt|br)?|naruto-(?:pt|br)(?:-s?[1-9][0-9]*)?)\.oasgames\.com$/i;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

function codeError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function validServerId(value) {
  const sid = Number(value);
  if (!Number.isSafeInteger(sid) || sid < 1 || sid > 99999) throw codeError('INVALID_SERVER_ID');
  return sid;
}

function safeAccountName(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 128 &&
    value !== '.' && value !== '..' && !/[\\/\u0000-\u001f\u007f]/.test(value);
}

function normalizeDomain(value) {
  if (typeof value !== 'string') return '';
  let host = value.toLowerCase();
  if (host.charAt(0) === '.') host = host.slice(1);
  if (!host || host.length > 253) return '';
  const labels = host.split('.');
  for (let i = 0; i < labels.length; i += 1) {
    if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(labels[i])) return '';
  }
  return host;
}

function domainMatches(host, domain) {
  const h = normalizeDomain(host);
  const d = normalizeDomain(domain);
  return !!(h && d && (h === d || h.slice(-(d.length + 1)) === '.' + d));
}

function allowedCookieDomain(host) {
  return COOKIE_SUFFIXES.some(function (suffix) { return domainMatches(host, suffix); });
}

function validCookieName(value) {
  return typeof value === 'string' && /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(value);
}

function validCookieValue(value) {
  return typeof value === 'string' && !/[\u0000-\u0020\u007f;,\\"]/.test(value);
}

function pathMatches(cookiePath, requestPath) {
  const cp = typeof cookiePath === 'string' && cookiePath.charAt(0) === '/' ? cookiePath : '/';
  const rp = requestPath || '/';
  if (rp === cp) return true;
  if (rp.indexOf(cp) !== 0) return false;
  return cp.charAt(cp.length - 1) === '/' || rp.charAt(cp.length) === '/';
}

function cookieApplies(cookie, destination, nowMs) {
  let url;
  try { url = new URL(destination); } catch (_) { return false; }
  if (url.protocol !== 'https:' || !cookie || typeof cookie !== 'object') return false;
  const rawHost = cookie.host || cookie.domain || '';
  const domain = normalizeDomain(rawHost);
  if (!domain || !allowedCookieDomain(domain)) return false;
  const hostOnly = cookie.hostOnly === undefined ? rawHost.charAt(0) !== '.' : !!cookie.hostOnly;
  if (hostOnly ? url.hostname.toLowerCase() !== domain : !domainMatches(url.hostname, domain)) return false;
  if (cookie.secure && url.protocol !== 'https:') return false;
  const now = typeof nowMs === 'number' ? nowMs : Date.now();
  if (cookie.expiresAt && cookie.expiresAt * 1000 <= now) return false;
  if (!pathMatches(cookie.path || '/', url.pathname || '/')) return false;
  return true;
}

function cookieHeader(cookies, destination) {
  const pairs = [];
  const seen = new Set();
  (cookies || []).forEach(function (cookie) {
    if (!cookieApplies(cookie, destination)) return;
    if (!validCookieName(cookie.name) || !validCookieValue(cookie.value)) return;
    const key = [cookie.host, cookie.path || '/', cookie.name].join('|');
    if (seen.has(key)) return;
    seen.add(key);
    pairs.push(cookie.name + '=' + cookie.value);
  });
  return pairs.join('; ');
}

function defaultProfileRoot(env) {
  const source = env || process.env;
  if (!source.APPDATA) throw codeError('APPDATA_NOT_SET');
  return path.join(source.APPDATA, 'Naruto Online', 'Browers', 'Cache');
}

function listAccounts(root) {
  const profileRoot = root || defaultProfileRoot();
  let entries;
  try { entries = fs.readdirSync(profileRoot, { withFileTypes: true }); }
  catch (_) { return []; }
  return entries.filter(function (entry) {
    if (!entry.isDirectory() || !safeAccountName(entry.name)) return false;
    try { return fs.statSync(path.join(profileRoot, entry.name, 'Cookies')).isFile(); }
    catch (_) { return false; }
  }).map(function (entry) {
    const dbPath = path.join(profileRoot, entry.name, 'Cookies');
    const stat = fs.statSync(dbPath);
    return { account: entry.name, dbPath: dbPath, mtimeMs: stat.mtimeMs, size: stat.size };
  }).sort(function (a, b) { return b.mtimeMs - a.mtimeMs; });
}

function readBrConfig(userDataDirectory, profileId) {
  if (!/^(br)-[1-9][0-9]*$/.test(String(profileId || ''))) return null;
  const file = path.join(userDataDirectory, 'br-session-recovery.json');
  let raw;
  try { raw = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (_) { return null; }
  if (!raw || raw.version !== 1 || !raw.profiles || typeof raw.profiles !== 'object' || Array.isArray(raw.profiles)) return null;
  const entry = raw.profiles[profileId];
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
  let serverId;
  try { serverId = validServerId(entry.serverId); }
  catch (_) { return null; }
  if (entry.officialAccount !== undefined && !safeAccountName(entry.officialAccount)) return null;
  if (entry.profileRoot !== undefined && (typeof entry.profileRoot !== 'string' || !entry.profileRoot.trim())) return null;
  return {
    serverId: serverId,
    officialAccount: entry.officialAccount || '',
    profileRoot: entry.profileRoot ? path.resolve(entry.profileRoot) : ''
  };
}

function parseRows(rows) {
  const now = Date.now();
  const sameSiteMap = { 0: 'None', 1: 'Lax', 2: 'Strict' };
  const cookies = [];
  let encryptedCount = 0;
  let skippedCount = 0;
  (Array.isArray(rows) ? rows : []).forEach(function (row) {
    const host = String(row.host_key || '');
    if (!allowedCookieDomain(host)) return;
    const value = typeof row.value === 'string' ? row.value : '';
    if (!value) {
      if (Number(row.encrypted_len || 0) > 0) encryptedCount += 1;
      skippedCount += 1;
      return;
    }
    if (!validCookieName(row.name || '') || !validCookieValue(value)) {
      skippedCount += 1;
      return;
    }
    let expiresAt = null;
    if (Number(row.has_expires || 0)) {
      const micros = Number(row.expires_utc || 0);
      if (Number.isFinite(micros) && micros > 0) {
        const seconds = micros / 1000000 - CHROMIUM_EPOCH_OFFSET_SECONDS;
        if (seconds > 0) expiresAt = seconds;
      }
    }
    if (expiresAt && expiresAt * 1000 <= now) {
      skippedCount += 1;
      return;
    }
    const sameSiteKey = row.samesite === null || row.samesite === undefined ? -1 : Number(row.samesite);
    cookies.push({
      host: host,
      hostOnly: host.charAt(0) !== '.',
      name: String(row.name),
      value: value,
      path: typeof row.path === 'string' && row.path.charAt(0) === '/' ? row.path : '/',
      secure: !!Number(row.is_secure || 0),
      httpOnly: !!Number(row.is_httponly || 0),
      sameSite: Object.prototype.hasOwnProperty.call(sameSiteMap, sameSiteKey) ? sameSiteMap[sameSiteKey] : undefined,
      expiresAt: expiresAt
    });
  });
  return { cookies: cookies, encryptedCount: encryptedCount, skippedCount: skippedCount };
}

function readCookies(dbPath, helperPath, timeoutMs, dpapiHelperPath) {
  return new Promise(function (resolve, reject) {
    try {
      const wal = dbPath + '-wal';
      if (fs.existsSync(wal) && fs.statSync(wal).size > 32) {
        reject(codeError('COOKIE_DB_WAL_NOT_CHECKPOINTED'));
        return;
      }
    } catch (error) {
      reject(codeError('COOKIE_DB_STAT_FAILED'));
      return;
    }

    const args = [
      '-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
      '-File', helperPath, '-Database', dbPath
    ];
    let child;
    try {
      child = spawn('powershell.exe', args, { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });
    } catch (_) {
      reject(codeError('POWERSHELL_UNAVAILABLE'));
      return;
    }
    let output = '';
    let settled = false;
    const finish = function (error, value) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) reject(error); else resolve(value);
    };
    const timer = setTimeout(function () {
      try { child.kill(); } catch (_) {}
      finish(codeError('COOKIE_DB_READ_TIMEOUT'));
    }, Number(timeoutMs) > 0 ? Number(timeoutMs) : 15000);
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (chunk) {
      output += chunk;
      if (Buffer.byteLength(output, 'utf8') > 2 * 1024 * 1024) {
        try { child.kill(); } catch (_) {}
        finish(codeError('COOKIE_DB_OUTPUT_TOO_LARGE'));
      }
    });
    child.on('error', function () { finish(codeError('POWERSHELL_UNAVAILABLE')); });
    child.on('close', function (code) {
      if (settled) return;
      if (code !== 0) {
        finish(codeError('COOKIE_DB_READ_FAILED'));
        return;
      }
      try {
        const parsed = JSON.parse(output.trim() || '[]');
        const rows = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
        // The SQLite reader process is closed; DPAPI has its own timeout.
        clearTimeout(timer);
        decryptCefRows(rows, dbPath, dpapiHelperPath, timeoutMs).then(function (result) {
          const parsed = parseRows(result.rows);
          parsed.decryptReason = result.reason || null;
          finish(null, parsed);
        }, function () {
          finish(codeError('COOKIE_DB_DECRYPT_FAILED'));
        });
      } catch (_) {
        finish(codeError('COOKIE_DB_INVALID_OUTPUT'));
      }
    });
  });
}


function cefLocalStatePaths(dbPath) {
  const account = path.dirname(dbPath);
  const cache = path.dirname(account);
  return [path.join(account, 'Local State'), path.join(cache, 'Local State'),
    path.join(path.dirname(cache), 'Local State'),
    path.join(path.dirname(path.dirname(cache)), 'Local State')];
}

function readCefKeyCandidates(dbPath) {
  const out = [];
  const seen = new Set();
  for (const filename of cefLocalStatePaths(dbPath)) {
    if (seen.has(filename)) continue;
    seen.add(filename);
    try {
      const stat = fs.statSync(filename);
      if (!stat.isFile() || stat.size > 512 * 1024) continue;
      const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
      const encoded = data && data.os_crypt && data.os_crypt.encrypted_key;
      if (typeof encoded !== 'string' || encoded.length > 8192) continue;
      const encrypted = Buffer.from(encoded, 'base64');
      // Chromium Local State's DPAPI-wrapped random AES key.
      if (encrypted.slice(0, 5).toString('ascii') === 'DPAPI')
        out.push({ kind: 'master', value: encrypted.slice(5).toString('base64') });
    } catch (_) { /* read-only candidate; nothing to export */ }
  }
  return out;
}

function dpapiUnprotect(blobs, helperPath, timeoutMs) {
  if (!blobs.length) return Promise.resolve([]);
  return new Promise(function (resolve, reject) {
    let child;
    try {
      child = spawn('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive',
        '-ExecutionPolicy', 'Bypass', '-File', helperPath],
        { stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true });
    } catch (_) { reject(codeError('DPAPI_UNPROTECT_FAILED')); return; }
    let settled = false;
    let output = '';
    const finish = function (err, data) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (err) reject(err); else resolve(data);
    };
    const timer = setTimeout(function () {
      try { child.kill(); } catch (_) {}
      finish(codeError('DPAPI_UNPROTECT_FAILED'));
    }, Math.max(3000, Math.min(Number(timeoutMs) || 15000, 30000)));
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (chunk) {
      output += chunk;
      if (Buffer.byteLength(output, 'utf8') > 2 * 1024 * 1024) {
        try { child.kill(); } catch (_) {}
        finish(codeError('DPAPI_UNPROTECT_FAILED'));
      }
    });
    child.on('error', function () { finish(codeError('DPAPI_UNPROTECT_FAILED')); });
    child.on('close', function (code) {
      if (settled) return;
      try {
        const decoded = JSON.parse(output.trim() || '{}');
        if (code !== 0 || !decoded || !Array.isArray(decoded.results) ||
            decoded.results.length !== blobs.length) throw new Error('DPAPI_INVALID_REPLY');
        finish(null, decoded.results.map(function (r) {
          return r && r.ok === true && typeof r.value === 'string' ? Buffer.from(r.value, 'base64') : null;
        }));
      } catch (_) { finish(codeError('DPAPI_UNPROTECT_FAILED')); }
    });
    child.stdin.on('error', function () { finish(codeError('DPAPI_UNPROTECT_FAILED')); });
    try { child.stdin.end(JSON.stringify({ blobs: blobs })); }
    catch (_) { finish(codeError('DPAPI_UNPROTECT_FAILED')); }
  });
}

function tryDecodeCookieBuffer(buffer, host) {
  if (!buffer || !buffer.length || buffer.length > 65536) return '';
  // Chromium 130+ database format may prefix SHA256(host_key) before value.
  if (buffer.length >= 32 && crypto.createHash('sha256').update(String(host), 'utf8').digest().equals(buffer.slice(0, 32)))
    buffer = buffer.slice(32);
  const value = buffer.toString('utf8');
  return Buffer.from(value, 'utf8').equals(buffer) && validCookieValue(value) ? value : '';
}

function tryDecryptAesCookie(raw, host, keys) {
  if (!raw || raw.length < 3 + 12 + 16) return '';
  const iv = raw.slice(3, 15);
  const tag = raw.slice(raw.length - 16);
  const text = raw.slice(15, raw.length - 16);
  for (const key of keys) {
    if (!key || key.length !== 32) continue;
    try {
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(tag);
      const plain = Buffer.concat([decipher.update(text), decipher.final()]);
      const decoded = tryDecodeCookieBuffer(plain, host);
      if (decoded) return decoded;
    } catch (_) { /* tag mismatch, try another CEF Local State key */ }
  }
  return '';
}

async function decryptCefRows(rows, dbPath, dpapiHelperPath, timeoutMs) {
  const encryptedRows = [];
  let hasAppBound = false;
  for (const row of rows) {
    if (!allowedCookieDomain(String(row.host_key || ''))) continue;
    if (typeof row.value === 'string' && row.value) continue;
    if (typeof row.encrypted_value_b64 !== 'string' || !row.encrypted_value_b64) continue;
    let raw;
    try { raw = Buffer.from(row.encrypted_value_b64, 'base64'); }
    catch (_) { continue; }
    if (raw.length < 8 || raw.length > 65536) continue;
    const prefix = raw.slice(0, 3).toString('ascii');
    if (prefix === 'v20') { hasAppBound = true; continue; }
    encryptedRows.push({ row: row, raw: raw, aes: prefix === 'v10' || prefix === 'v11' });
  }
  if (!encryptedRows.length) return { rows: rows, reason: hasAppBound ? 'cef_app_bound_encryption_unsupported' : null };
  const master = readCefKeyCandidates(dbPath);
  const direct = encryptedRows.filter(function (item) { return !item.aes; });
  const blobs = master.concat(direct.map(function (item) { return { kind: 'direct', value: item.raw.toString('base64') }; }));
  let recovered;
  try { recovered = await dpapiUnprotect(blobs.map(function (b) { return b.value; }), dpapiHelperPath, timeoutMs); }
  catch (_) { return { rows: rows, reason: 'dpapi_unprotect_failed' }; }
  const keys = recovered.slice(0, master.length).filter(function (b) { return b && b.length === 32; });
  let success = 0;
  for (const item of encryptedRows) {
    const index = direct.indexOf(item);
    const value = item.aes ? tryDecryptAesCookie(item.raw, item.row.host_key, keys)
      : tryDecodeCookieBuffer(recovered[master.length + index], item.row.host_key);
    if (value) {
      item.row.value = value;
      success++;
    }
  }
  let reason = null;
  if (success < encryptedRows.length || hasAppBound) {
    if (hasAppBound) reason = 'cef_app_bound_encryption_unsupported';
    else if (encryptedRows.some(function (x) { return x.aes; }) && !master.length) reason = 'cef_master_key_unavailable';
    else reason = 'cef_cookie_decryption_failed';
  }
  return { rows: rows, reason: reason };
}

function serverListUrl(serverId) {
  const sid = validServerId(serverId);
  return 'https://' + PORTAL_HOST + PORTAL_PATH + sid + '?' + PORTAL_QUERY;
}

function decodeBody(headers, raw) {
  const encoding = String(headers['content-encoding'] || '').toLowerCase();
  if (encoding.indexOf('gzip') !== -1) return zlib.gunzipSync(raw).toString('utf8');
  if (encoding.indexOf('deflate') !== -1) {
    try { return zlib.inflateSync(raw).toString('utf8'); }
    catch (_) { return zlib.inflateRawSync(raw).toString('utf8'); }
  }
  return raw.toString('utf8');
}

function serverIdFromHost(hostname) {
  let match = /^s([1-9][0-9]*)-naruto(?:pt|br)?\.oasgames\.com$/i.exec(hostname);
  if (!match) match = /^naruto-(?:pt|br)-s?([1-9][0-9]*)\.oasgames\.com$/i.exec(hostname);
  return match ? match[1] : null;
}

function validateServerBoundEntry(value, expectedServerId, portalBound) {
  try {
    const sid = String(validServerId(expectedServerId));
    if (typeof value !== 'string' || value.length > 16384 || /[\u0000-\u0020\u007f]/.test(value)) return null;
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash ||
        !GAME_HOST_RE.test(url.hostname) || url.pathname !== '/main.html') return null;
    const hostSid = serverIdFromHost(url.hostname);
    if (hostSid && hostSid !== sid) return null;
    const signs = url.searchParams.getAll('sign');
    const serverIds = url.searchParams.getAll('server_id');
    if (signs.length !== 1 || !signs[0] || signs[0].length > 2048) return null;
    if (serverIds.length > 1) return null;
    if (serverIds.length === 1 && serverIds[0] !== sid) return null;
    if (!hostSid && serverIds.length !== 1 && portalBound !== true) return null;
    return url.href;
  } catch (_) {
    return null;
  }
}

function extractLaunchUrl(html, serverId) {
  if (typeof html !== 'string' || !html) return null;
  const normalized = html.replace(/&amp;/g, '&');
  const re = /https:\/\/[^"'\s<>\\]+/ig;
  let match;
  while ((match = re.exec(normalized)) !== null) {
    const candidate = match[0].replace(/[),;]+$/, '');
    const valid = validateServerBoundEntry(candidate, serverId, true);
    if (valid) return valid;
  }
  return null;
}

function requestPortal(cookies, serverId, options) {
  const opts = options || {};
  const url = serverListUrl(serverId);
  const cookie = cookieHeader(cookies, url);
  if (!cookie) return Promise.resolve({ ok: false, stage: 'portal', reason: 'no_portal_cookies' });
  return new Promise(function (resolve) {
    let request;
    let settled = false;
    const finish = function (value) {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    const headers = {
      'User-Agent': opts.userAgent || UA,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6',
      'Accept-Encoding': 'gzip, deflate',
      'Cache-Control': 'max-age=0',
      'Upgrade-Insecure-Requests': '1',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'Referer': 'https://' + PORTAL_HOST + '/'
    };
    headers.Cookie = cookie;
    const maxBytes = Number(opts.maxBytes) > 0 ? Number(opts.maxBytes) : 8 * 1024 * 1024;
    try {
      request = https.request({
        protocol: 'https:',
        hostname: PORTAL_HOST,
        method: 'GET',
        path: new URL(url).pathname + new URL(url).search,
        headers: headers,
        timeout: Number(opts.timeoutMs) > 0 ? Number(opts.timeoutMs) : 20000,
        rejectUnauthorized: true
      }, function (response) {
        const chunks = [];
        let total = 0;
        response.on('data', function (chunk) {
          total += chunk.length;
          if (total > maxBytes) {
            request.destroy(codeError('PORTAL_RESPONSE_TOO_LARGE'));
            return;
          }
          chunks.push(chunk);
        });
        response.on('end', function () {
          const status = Number(response.statusCode || 0);
          if (status >= 300 && status < 400) {
            finish({ ok: false, stage: 'portal', reason: 'portal_redirect_rejected', status: status });
            return;
          }
          let html;
          try { html = decodeBody(response.headers, Buffer.concat(chunks)); }
          catch (_) {
            finish({ ok: false, stage: 'portal', reason: 'portal_decode_failed', status: status });
            return;
          }
          const low = html.slice(0, 20000).toLowerCase();
          if (status === 403 || status === 429 ||
              ['cloudflare', 'attention required', 'just a moment', 'you have been blocked'].some(function (m) { return low.indexOf(m) !== -1; })) {
            finish({ ok: false, stage: 'portal', reason: 'portal_blocked', status: status });
            return;
          }
          if (['user_password', 'passport.oasgames.com', 'id="loginform"', 'name="user_email"'].some(function (m) { return low.indexOf(m) !== -1; })) {
            finish({ ok: false, stage: 'portal', reason: 'session_expired', status: status });
            return;
          }
          if (status < 200 || status >= 300) {
            finish({ ok: false, stage: 'portal', reason: 'portal_http_error', status: status });
            return;
          }
          const launchUrl = extractLaunchUrl(html, serverId);
          if (!launchUrl) {
            finish({ ok: false, stage: 'extract', reason: 'br_signed_entry_not_found', status: status });
            return;
          }
          finish({ ok: true, stage: 'portal', launchUrl: launchUrl, status: status });
        });
      });
    } catch (_) {
      finish({ ok: false, stage: 'portal', reason: 'portal_request_failed' });
      return;
    }
    request.on('timeout', function () { request.destroy(codeError('PORTAL_TIMEOUT')); });
    request.on('error', function (error) {
      const code = error && error.code === 'PORTAL_RESPONSE_TOO_LARGE' ? 'portal_response_too_large' :
        error && error.code === 'PORTAL_TIMEOUT' ? 'portal_timeout' : 'portal_request_failed';
      finish({ ok: false, stage: 'portal', reason: code });
    });
    request.end();
  });
}


function hasEdgePortalCookie(cookies, destination) {
  let parsed;
  try { parsed = new URL(destination); } catch (_) { return false; }
  return (cookies || []).some(function (cookie) {
    if (!cookie || !validCookieName(cookie.name) || !validCookieValue(cookie.value)) return false;
    if (cookieApplies(cookie, destination)) return true;
    return cookie.name === 'oas_user' && cookie.hostOnly === true &&
      normalizeDomain(cookie.host) === 'narutowebgame.com' &&
      parsed.hostname === PORTAL_HOST &&
      pathMatches(cookie.path || '/', parsed.pathname) &&
      (!cookie.expiresAt || cookie.expiresAt * 1000 > Date.now());
  });
}

// Fetch the server-list page through the installed Edge (modern Chromium).
// Node's TLS fingerprint is rejected by Cloudflare on this portal, while Edge
// passes and the page still embeds the signed main.html launch URL.
function requestPortalViaEdge(cookies, serverId, helperPath, options) {
  const opts = options || {};
  const url = serverListUrl(serverId);
  if (!hasEdgePortalCookie(cookies, url)) return Promise.resolve({ ok: false, stage: 'portal', reason: 'no_portal_cookies' });
  return new Promise(function (resolve) {
    let child;
    try {
      child = spawn('powershell.exe', [
        '-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', helperPath
      ], { stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true });
    } catch (_) {
      resolve({ ok: false, stage: 'portal', reason: 'portal_helper_unavailable' });
      return;
    }
    let output = '';
    let settled = false;
    const killTree = function () {
      try { spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true }); } catch (_) {}
    };
    const finish = function (value) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { child.kill(); } catch (_) {}
      resolve(value);
    };
    const timer = setTimeout(function () {
      killTree();
      finish({ ok: false, stage: 'portal', reason: 'portal_timeout' });
    }, Number(opts.timeoutMs) > 0 ? Number(opts.timeoutMs) : 90000);
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (chunk) {
      output += chunk;
      if (Buffer.byteLength(output, 'utf8') > 8 * 1024 * 1024) {
        killTree();
        finish({ ok: false, stage: 'portal', reason: 'portal_response_too_large' });
      }
    });
    child.on('error', function () { finish({ ok: false, stage: 'portal', reason: 'portal_helper_unavailable' }); });
    child.on('close', function () {
      if (settled) return;
      let parsed;
      try { parsed = JSON.parse((output || '').trim()); }
      catch (_) { finish({ ok: false, stage: 'portal', reason: 'portal_helper_invalid_output' }); return; }
      if (!parsed || parsed.ok !== true || typeof parsed.html !== 'string') {
        finish({ ok: false, stage: 'portal', reason: (parsed && parsed.reason) || 'portal_helper_failed', status: (parsed && parsed.status) || null });
        return;
      }
      const launchUrl = extractLaunchUrl(parsed.html, serverId);
      if (!launchUrl) { finish({ ok: false, stage: 'extract', reason: 'br_signed_entry_not_found', status: parsed.status || 200 }); return; }
      finish({ ok: true, stage: 'portal', launchUrl: launchUrl, status: parsed.status || 200 });
    });
    try {
      child.stdin.write(JSON.stringify({ url: url, cookies: cookies }));
      child.stdin.end();
    } catch (_) {
      finish({ ok: false, stage: 'portal', reason: 'portal_helper_write_failed' });
    }
  });
}

function electronCookieDetails(cookie) {
  const host = normalizeDomain(cookie.host);
  if (!host || !allowedCookieDomain(host) || !validCookieName(cookie.name) || !validCookieValue(cookie.value)) return null;
  const details = {
    url: 'https://' + host + (cookie.path || '/'),
    name: cookie.name,
    value: cookie.value,
    path: cookie.path || '/',
    secure: !!cookie.secure,
    httpOnly: !!cookie.httpOnly
  };
  if (!cookie.hostOnly) details.domain = '.' + host;
  if (cookie.expiresAt) details.expirationDate = cookie.expiresAt;
  if (cookie.sameSite === 'None' && details.secure) details.sameSite = 'no_restriction';
  else if (cookie.sameSite === 'Lax') details.sameSite = 'lax';
  else if (cookie.sameSite === 'Strict') details.sameSite = 'strict';
  return details;
}

class BrSessionRecovery {
  constructor(options) {
    const opts = options || {};
    this.profileRoot = opts.profileRoot || defaultProfileRoot();
    this.helperPath = opts.helperPath || path.join(__dirname, '../../scripts/br-cookie-reader.ps1');
    this.portalHelperPath = opts.portalHelperPath || path.join(__dirname, '../../scripts/br-portal-fetch.ps1');
    this.dpapiHelperPath = opts.dpapiHelperPath || path.join(__dirname, '../../scripts/br-cookie-dpapi.ps1');
    this.timeoutMs = opts.timeoutMs || 15000;
    this.portalTimeoutMs = opts.portalTimeoutMs || 90000;
    this.portalOptions = opts.portalOptions || {};
  }

  listAccounts() { return listAccounts(this.profileRoot); }

  async recover(options) {
    const opts = options || {};
    let serverId;
    try { serverId = validServerId(opts.serverId); }
    catch (error) { return { ok: false, stage: 'selection', reason: error.code || 'invalid_server_id' }; }
    const accounts = this.listAccounts();
    let account = opts.account;
    if (!account && accounts.length === 1) account = accounts[0].account;
    if (!safeAccountName(account)) return { ok: false, stage: 'selection', reason: 'official_account_selection_required' };
    const selected = accounts.find(function (item) { return item.account.toLowerCase() === account.toLowerCase(); });
    if (!selected) return { ok: false, stage: 'selection', reason: 'exact_official_profile_not_found' };
    if (typeof opts.isCancelled === 'function' && opts.isCancelled()) return { ok: false, stage: 'cancel', reason: 'cancelled' };

    let cookieRead;
    try { cookieRead = await readCookies(selected.dbPath, this.helperPath, this.timeoutMs, this.dpapiHelperPath); }
    catch (error) { return { ok: false, stage: 'cookies', reason: error.code || 'cookie_db_read_failed' }; }
    if (!cookieRead.cookies.length) {
      return {
        ok: false,
        stage: 'cookies',
        reason: cookieRead.decryptReason || (cookieRead.encryptedCount ? 'encrypted_cookie_values_unsupported' : 'no_valid_game_cookies'),
        encryptedCount: cookieRead.encryptedCount || 0
      };
    }

    // The portal needs a valid authentication cookie; never inject a known partial login.
    if (!hasEdgePortalCookie(cookieRead.cookies, serverListUrl(serverId))) {
      return { ok: false, stage: 'cookies', reason: cookieRead.decryptReason || 'no_portal_cookies' };
    }
    let launch = await requestPortalViaEdge(cookieRead.cookies, serverId, this.portalHelperPath, { timeoutMs: this.portalTimeoutMs });
    if (!launch.ok && (/^portal_helper_/.test(String(launch.reason || '')) || launch.reason === 'edge_unavailable' || launch.reason === 'portal_timeout')) {
      launch = await requestPortal(cookieRead.cookies, serverId, this.portalOptions);
    }
    if (!launch.ok || validateServerBoundEntry(launch.launchUrl, serverId, true) !== launch.launchUrl) {
      return { ok: false, stage: launch.stage || 'portal', reason: launch.reason || 'invalid_launch_entry', status: launch.status || null };
    }
    if (typeof opts.isCancelled === 'function' && opts.isCancelled()) return { ok: false, stage: 'cancel', reason: 'cancelled' };

    if (typeof opts.updateCookies !== 'function') return { ok: false, stage: 'inject', reason: 'cookie_session_update_unavailable' };
    let injected = 0;
    let skipped = 0;
    try {
      await opts.updateCookies(async function (ses) {
        const existing = await ses.cookies.get({ name: 'imsdk_param_login' });
        for (let i = 0; i < existing.length; i += 1) {
          const old = existing[i];
          const oldHost = normalizeDomain(old.domain || '');
          if (!allowedCookieDomain(oldHost)) continue;
          const oldUrl = 'https://' + oldHost + (old.path || '/');
          try { await ses.cookies.remove(oldUrl, old.name); } catch (_) {}
        }
        for (let i = 0; i < cookieRead.cookies.length; i += 1) {
          const cookie = cookieRead.cookies[i];
          if (SKIP_INJECTION.has(String(cookie.name || '').toLowerCase())) {
            skipped += 1;
            continue;
          }
          const details = electronCookieDetails(cookie);
          if (!details) { skipped += 1; continue; }
          try {
            await ses.cookies.set(details);
            injected += 1;
          } catch (_) { skipped += 1; }
        }
        if (ses.cookies && typeof ses.cookies.flushStore === 'function') await ses.cookies.flushStore();
      });
    } catch (_) {
      return { ok: false, stage: 'inject', reason: 'electron_cookie_import_failed', injected: injected, skipped: skipped };
    }
    if (!injected) return { ok: false, stage: 'inject', reason: 'no_game_cookies_accepted', skipped: skipped };
    if (typeof opts.isCancelled === 'function' && opts.isCancelled()) return { ok: false, stage: 'cancel', reason: 'cancelled' };

    // launchUrl is intentionally returned only to the caller for immediate navigation.
    return {
      ok: true,
      stage: 'session_restored',
      region: 'br',
      language: 'pt-BR',
      account: account,
      serverId: serverId,
      cookieCount: cookieRead.cookies.length,
      injected: injected,
      skipped: skipped,
      status: launch.status || null,
      launchUrl: launch.launchUrl
    };
  }
}

module.exports = {
  BrSessionRecovery: BrSessionRecovery,
  readConfig: readBrConfig,
  listAccounts: listAccounts,
  validateServerBoundEntry: validateServerBoundEntry,
  extractLaunchUrl: extractLaunchUrl,
  serverListUrl: serverListUrl,
  cookieHeader: cookieHeader,
  parseRows: parseRows,
  electronCookieDetails: electronCookieDetails,
  hasEdgePortalCookie: hasEdgePortalCookie,
  tryDecryptAesCookie: tryDecryptAesCookie,
  cefLocalStatePaths: cefLocalStatePaths
};
