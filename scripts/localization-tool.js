"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { createHash } = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_MANIFEST = path.join(ROOT, "patches", "patch-manifest.json");
const METADATA_FILE = path.join(ROOT, "localization", "patch-metadata.json");
const AI_SOURCE = path.join(ROOT, "localization", "sources", "br", "flash", "ai", "AILogTemplate.xml");
const AI_STRINGS = path.join(ROOT, "localization", "zh-CN", "ai-log-template.json");
const AI_OUTPUT = path.join(ROOT, "patches", "flash", "ai", "AILogTemplate.xml");

function fail(message) {
  throw new Error(message);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

function isSha256(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
}

function normalizeRelative(value) {
  const normalized = String(value || "").replace(/\\/g, "/");
  if (!normalized || normalized.startsWith("/") || /^[a-zA-Z]:/.test(normalized) || normalized.split("/").includes("..")) {
    fail(`Invalid relative patch path: ${value}`);
  }
  return normalized;
}

function readCompressedText(file) {
  const compressed = fs.readFileSync(file);
  try {
    return {
      compressed,
      text: zlib.inflateSync(compressed).toString("utf8")
    };
  } catch (error) {
    fail(`${file} is not a valid zlib-compressed UTF-8 resource: ${error.message}`);
  }
}

function placeholders(value) {
  return [...String(value).matchAll(/%\d+/g)].map(match => match[0]).sort();
}

function samePlaceholders(left, right) {
  return JSON.stringify(placeholders(left)) === JSON.stringify(placeholders(right));
}

function refreshManifest(manifestFile = DEFAULT_MANIFEST) {
  const manifest = readJson(manifestFile);
  const metadata = readJson(METADATA_FILE);
  const metadataByFile = new Map(
    Object.entries(metadata).map(([key, value]) => [normalizeRelative(key).toLowerCase(), value])
  );
  const patchDir = path.dirname(manifestFile);
  const seen = new Set();

  manifest.version = 6;
  manifest.requireSha256 = true;
  manifest.patches = manifest.patches.map((entry, index) => {
    const file = normalizeRelative(entry.file);
    if (seen.has(file.toLowerCase())) fail(`Duplicate patch file: ${file}`);
    seen.add(file.toLowerCase());

    const absolute = path.join(patchDir, file);
    if (!fs.existsSync(absolute)) fail(`Missing patch file: ${file}`);

    const extra = metadataByFile.get(file.toLowerCase());
    if (!extra) fail(`Missing localization metadata for: ${file}`);

    return {
      path: String(entry.path || "/" + file).replace(/\\/g, "/"),
      file,
      sha256: sha256(fs.readFileSync(absolute)),
      mimeType: entry.mimeType || (file.toLowerCase().endsWith(".swf") ? "application/x-shockwave-flash" : "text/plain; charset=utf-8"),
      strategy: extra.strategy || "whole-file",
      sourceVersion: extra.sourceVersion || "unverified",
      ...(extra.sourceUrl ? { sourceUrl: extra.sourceUrl } : {}),
      ...(isSha256(extra.sourceSha256) ? { sourceSha256: extra.sourceSha256.toLowerCase() } : {}),
      compatibility: extra.compatibility || "unknown",
      note: extra.note || entry.note || `localization patch ${index + 1}`
    };
  });

  const forbidden = manifest.patches.find(entry => entry.path.toLowerCase().endsWith("/flash/core/naruto.include.swf"));
  if (forbidden) fail("naruto.include.swf must never be shipped as a whole-SWF patch");

  writeJson(manifestFile, manifest);
  process.stdout.write(`Updated ${manifestFile} with ${manifest.patches.length} verified entries.\n`);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceTemplate(text, type, source, target, key) {
  const pattern = new RegExp(
    `(<Template>\\s*<Type>${escapeRegExp(type)}</Type>\\s*<Info><!\\[CDATA\\[)([\\s\\S]*?)(\\]\\]></Info>)`
  );
  const match = text.match(pattern);
  if (!match) fail(`Template ${type} was not found in source XML`);
  if (typeof source === "string" && match[2] !== source) {
    fail(`${key} sourceText does not match the fixed BR resource`);
  }
  if (!samePlaceholders(match[2], target)) {
    fail(`${key} changed placeholders: source=${JSON.stringify(placeholders(match[2]))} target=${JSON.stringify(placeholders(target))}`);
  }
  return text.replace(pattern, `$1${target}$3`);
}

function replaceEnum(text, enumKey, source, target, key) {
  const pattern = new RegExp(`(<Item\\s+key="${escapeRegExp(enumKey)}"\\s+value=")([^"]*)("\\s*/>)`);
  const match = text.match(pattern);
  if (!match) fail(`Enum ${enumKey} was not found in source XML`);
  if (typeof source === "string" && match[2] !== source) {
    fail(`${key} sourceText does not match the fixed BR resource`);
  }
  return text.replace(pattern, (full, prefix, source, suffix) => {
    if (!samePlaceholders(source, target)) {
      fail(`${key} changed placeholders: source=${JSON.stringify(placeholders(source))} target=${JSON.stringify(placeholders(target))}`);
    }
    return prefix + target + suffix;
  });
}

function buildAiLog() {
  const source = readCompressedText(AI_SOURCE);
  const translations = readJson(AI_STRINGS);
  const entries = Array.isArray(translations.entries) ? translations.entries : [];
  let output = source.text;
  let translated = 0;

  for (const entry of entries) {
    if (!entry || entry.status !== "translated") continue;
    if (typeof entry.key !== "string" || typeof entry.zhCN !== "string") {
      fail("Every translated AI-log entry requires string key and zhCN fields");
    }
    if (entry.key.startsWith("ai.template.")) {
      output = replaceTemplate(output, entry.key.slice("ai.template.".length), entry.sourceText, entry.zhCN, entry.key);
    } else if (entry.key.startsWith("ai.enum.")) {
      output = replaceEnum(output, entry.key.slice("ai.enum.".length), entry.sourceText, entry.zhCN, entry.key);
    } else {
      fail(`Unsupported AI-log translation key: ${entry.key}`);
    }
    translated += 1;
  }

  if (translated === 0) fail("No translated AI-log entries were found");
  const compressed = zlib.deflateSync(Buffer.from(output, "utf8"), { level: 9 });
  fs.mkdirSync(path.dirname(AI_OUTPUT), { recursive: true });
  fs.writeFileSync(AI_OUTPUT, compressed);
  process.stdout.write(
    `Built ${AI_OUTPUT}; entries=${translated} compressed=${compressed.length} sha256=${sha256(compressed)}\n`
  );
}

const COMPRESSED_SOURCES = new Map([
  ["config/i18n/translatedkeycfg.cfg", path.join(ROOT, "localization", "sources", "br", "config", "i18n", "TranslatedKeyCFG.cfg")],
  ["flash/ai/ailogtemplate.xml", AI_SOURCE]
]);

function countBy(items) {
  const result = {};
  for (const item of items) result[item] = (result[item] || 0) + 1;
  return result;
}

function compressedStructure(text) {
  return {
    records: (text.match(/(?:^|\r?\n)[^\r\n]*[A-Za-z]+_[A-Za-z0-9]+_[0-9a-f]{32}(?=\r?$)/gm) || []).length,
    templates: (text.match(/<Template>/g) || []).length,
    placeholders: countBy(placeholders(text)),
    htmlTags: countBy([...String(text).matchAll(/<\/?([a-z][a-z0-9]*)\b/gi)].map(match => match[1].toLowerCase()))
  };
}

function auditManifest(manifestFile = DEFAULT_MANIFEST) {
  const manifest = readJson(manifestFile);
  const patchDir = path.dirname(manifestFile);
  const errors = [];
  const warnings = [];
  const files = [];
  const seenPaths = new Set();

  if (manifest.version < 6 || manifest.requireSha256 !== true) {
    errors.push(`Manifest must use version >= 6 with requireSha256=true, found version=${manifest.version}`);
  }
  if (!Array.isArray(manifest.patches) || !manifest.patches.length) errors.push("Manifest has no patches");

  for (const entry of manifest.patches || []) {
    const file = normalizeRelative(entry.file);
    const absolute = path.join(patchDir, file);
    const record = {
      path: entry.path,
      file,
      exists: fs.existsSync(absolute),
      sha256Valid: isSha256(entry.sha256),
      hashMatches: false,
      size: 0,
      format: path.extname(file).slice(1).toLowerCase() || "unknown"
    };

    if (seenPaths.has(String(entry.path).toLowerCase())) errors.push(`Duplicate request path: ${entry.path}`);
    seenPaths.add(String(entry.path).toLowerCase());
    if (String(entry.path).toLowerCase().endsWith("/flash/core/naruto.include.swf")) {
      errors.push("Forbidden whole-SWF patch: /flash/core/naruto.include.swf");
    }
    if (!record.sha256Valid) errors.push(`${file}: invalid SHA-256`);
    if (!fs.existsSync(absolute)) {
      errors.push(`${file}: missing file`);
      files.push(record);
      continue;
    }

    const data = fs.readFileSync(absolute);
    record.size = data.length;
    record.hashMatches = sha256(data) === String(entry.sha256).toLowerCase();
    if (!record.hashMatches) errors.push(`${file}: SHA-256 mismatch`);

    if (file.toLowerCase().endsWith(".swf")) {
      const signature = data.subarray(0, 3).toString("ascii");
      record.format = signature;
      if (!["FWS", "CWS", "ZWS"].includes(signature)) errors.push(`${file}: invalid SWF signature ${signature}`);
      if (signature === "ZWS") warnings.push(`${file}: non-standard ZWS resources require a dedicated repacker`);
    } else if (/\.(cfg|xml)$/i.test(file)) {
      try {
        const inflated = zlib.inflateSync(data);
        const text = inflated.toString("utf8");
        record.inflatedSize = inflated.length;
        record.format = "zlib";
        record.chineseCharacters = (text.match(/[\u4e00-\u9fff]/g) || []).length;
        record.commonPortugueseTerms = (text.match(/\b(Entrar|Jogar|Atividade|Equipamento|Amigo|Arena|Guilda|Modo|Automático|Recompensa|Missão|Ranking|Loja)\b/gi) || []).length;
        if (file.toLowerCase().endsWith("/translatedkeycfg.cfg") && record.commonPortugueseTerms > 0) {
          warnings.push(`${file}: contains ${record.commonPortugueseTerms} common Portuguese terms; translation remains partial`);
        }
        if (file.toLowerCase().endsWith("/flash/ai/ailogtemplate.xml") && /(du erhältst|Ninja-Prüfung|Início do Modo Automático|O Modo Automático terminou)/i.test(text)) {
          errors.push(`${file}: known untranslated AI template text remains`);
        }
        const sourceFile = COMPRESSED_SOURCES.get(file.toLowerCase());
        if (sourceFile && fs.existsSync(sourceFile)) {
          const sourceData = fs.readFileSync(sourceFile);
          if (entry.sourceSha256 && sha256(sourceData) !== entry.sourceSha256) {
            errors.push(`${file}: source SHA-256 mismatch`);
          }
          const source = readCompressedText(sourceFile);
          const sourceStructure = compressedStructure(source.text);
          const targetStructure = compressedStructure(text);
          record.sourceRecordCount = sourceStructure.records;
          record.targetRecordCount = targetStructure.records;
          record.sourceTemplateCount = sourceStructure.templates;
          record.targetTemplateCount = targetStructure.templates;
          if (JSON.stringify(sourceStructure.placeholders) !== JSON.stringify(targetStructure.placeholders)) {
            const message = `${file}: placeholder counts changed from source`;
            if (file.toLowerCase().endsWith("/flash/ai/ailogtemplate.xml")) errors.push(message);
            else warnings.push(message);
          }
          if (JSON.stringify(sourceStructure.htmlTags) !== JSON.stringify(targetStructure.htmlTags)) {
            const message = `${file}: HTML tag counts changed from source`;
            if (file.toLowerCase().endsWith("/flash/ai/ailogtemplate.xml")) errors.push(message);
            else warnings.push(message);
          }
          if (sourceStructure.records && sourceStructure.records !== targetStructure.records) {
            errors.push(`${file}: compressed record count changed from ${sourceStructure.records} to ${targetStructure.records}`);
          }
          if (sourceStructure.templates && sourceStructure.templates !== targetStructure.templates) {
            errors.push(`${file}: template count changed from ${sourceStructure.templates} to ${targetStructure.templates}`);
          }
        } else if (sourceFile) {
          errors.push(`${file}: source baseline is missing`);
        }
      } catch (error) {
        errors.push(`${file}: invalid zlib resource (${error.message})`);
      }
    }

    files.push(record);
  }

  const result = {
    manifest: manifestFile,
    version: manifest.version,
    enabled: manifest.enabled,
    patchCount: manifest.patches?.length || 0,
    totalBytes: files.reduce((sum, item) => sum + item.size, 0),
    errors,
    warnings,
    files
  };
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  if (errors.length) process.exitCode = 1;
}

function main() {
  const command = process.argv[2];
  if (command === "build-ai-log") {
    buildAiLog();
    return;
  }
  if (command === "refresh-manifest") {
    refreshManifest();
    return;
  }
  if (command === "audit") {
    auditManifest();
    return;
  }
  fail("Usage: node scripts/localization-tool.js <build-ai-log|refresh-manifest|audit>");
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}
