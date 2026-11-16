/* ozellik-zigzag-2 — Özellik Kartları Izgarası (1 Kas 2026, T1-B varyant).
   Yer tutucular: oz2cols oz2head oz2cards. Veri: json.data[] = [{baslik{}, metin{}, ikon?, img?, alt{}?, url?}].
   Ortak yardımcılar: esc t guvenliHref gorselYol evet sayi metinleriYaz (desing metinleri kaçışlı). */
var D = json.desing || {};
var L = json.lang || "tr";

/* HTML kaçışı — html'e giden her değer bundan geçer */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
/* Dil seçimi: aktif dil → tr → en → ilk anahtar (motorun wmPickLang'i) */
function t(v) { return wmPickLang(v, L); }
/* Bağlantı: dış/mailto/tel/# aynen; iç sayfa adı → dil önekli yol; javascript: vb. reddedilir */
function guvenliHref(v) {
  var s = String(v == null ? "" : v).trim();
  if (!s) { return ""; }
  if (/^\s*(javascript|vbscript|file|data):/i.test(s)) { return ""; }
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s) || s.charAt(0) === "/") { return s; }
  return wxLangInternalHref(s);
}
/* Görsel yolu: "/" ve http(s) aynen; yalın ad → /img/<ad>; tehlikeli şema → "" */
function gorselYol(v) {
  var s = String(v == null ? "" : v).trim();
  if (!s) { return ""; }
  if (/^\s*(javascript|vbscript|file|data):/i.test(s)) { return ""; }
  if (s.charAt(0) === "/" || /^https?:\/\//i.test(s)) { return s; }
  return "/img/" + s;
}
function evet(v, d) {
  if (v === undefined || v === null || v === "") { return d; }
  return !(v === false || v === "false" || v === 0 || v === "0");
}
function sayi(v, d, mn, mx) {
  var n = parseInt(v, 10);
  if (!isFinite(n)) { n = d; }
  return Math.min(mx, Math.max(mn, n));
}
/* desing'deki düz metin / {tr,en,ar} değerlerini {{anahtar}} yerine KAÇIŞLI yazar.
   Motor aynı yer tutucuyu ham yazardı; back.js önce davrandığı için kaçışsız değer html'e ulaşmaz. */
function metinleriYaz() {
  var k;
  for (k in D) {
    if (!Object.prototype.hasOwnProperty.call(D, k)) { continue; }
    var v = D[k];
    if (v == null) { continue; }
    var dilli = typeof v === "object" && !Array.isArray(v) && (typeof v.tr === "string" || typeof v.en === "string");
    if (typeof v === "object" && !dilli) { continue; }
    var deger = esc(t(v));
    var desen = new RegExp("\\{\\{" + String(k).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\}\\}", "g");
    html = html.replace(desen, function () { return deger; });
  }
}

var oz2Items = Array.isArray(json.data) ? json.data : [];
var oz2Cols = sayi(D.columns, 3, 2, 4);
var oz2Cta = t(D.ctaLabel);
var oz2Cards = "";
var oz2i;
for (oz2i = 0; oz2i < oz2Items.length; oz2i++) {
  var it = oz2Items[oz2i] || {};
  var baslik = t(it.baslik);
  var metin = t(it.metin);
  if (!baslik && !metin) { continue; }
  var img = gorselYol(it.img);
  var url = guvenliHref(it.url);
  var medya = img
    ? '<img class="modulex-oz2-img" src="' + esc(img) + '" alt="' + esc(t(it.alt)) + '" width="800" height="500" loading="lazy" decoding="async" />'
    : '<span class="modulex-oz2-ikon" aria-hidden="true"><span class="material-symbols-outlined">' + esc(it.ikon || "star") + "</span></span>";
  var baslikHtml = baslik ? '<h3 class="modulex-oz2-h">' + (url ? '<a class="modulex-oz2-a" href="' + esc(url) + '">' + esc(baslik) + "</a>" : esc(baslik)) + "</h3>" : "";
  oz2Cards += '<li class="modulex-oz2-card' + (img ? " modulex-oz2-gorselli" : "") + '">' + medya +
    '<div class="modulex-oz2-govde">' + baslikHtml +
    (metin ? '<p class="modulex-oz2-p">' + esc(metin) + "</p>" : "") +
    (url && oz2Cta ? '<span class="modulex-oz2-more" aria-hidden="true">' + esc(oz2Cta) + '<span class="material-symbols-outlined">arrow_forward</span></span>' : "") +
    "</div></li>";
}

var oz2Head = "";
if (t(D.eyebrow) || t(D.title) || t(D.description)) {
  oz2Head = '<header class="modulex-oz2-head">' +
    (t(D.eyebrow) ? '<p class="modulex-oz2-eyebrow">' + esc(t(D.eyebrow)) + "</p>" : "") +
    (t(D.title) ? '<h2 class="modulex-oz2-title">' + esc(t(D.title)) + "</h2>" : "") +
    (t(D.description) ? '<p class="modulex-oz2-desc">' + esc(t(D.description)) + "</p>" : "") + "</header>";
}

html = html.replace(/\{\{oz2cols\}\}/g, function () { return String(oz2Cols); });
html = html.replace(/\{\{oz2head\}\}/g, function () { return oz2Head; });
html = html.replace(/\{\{oz2cards\}\}/g, function () { return oz2Cards; });
metinleriYaz();
