/* pt documentation — behaviour.
 *
 * No dependencies and no network: the search index is a plain <script> that
 * assigns window.__SEARCH__, because fetch() is blocked on file:// and this
 * site is meant to be read straight off disk.
 */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ------------------------------------------------------------- theme -- */

  try {
    var stored = localStorage.getItem("pt-docs-theme");
    if (stored) root.setAttribute("data-theme", stored);
  } catch (e) {}

  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") === "dark";
      if (!root.hasAttribute("data-theme")) {
        dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      var next = dark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("pt-docs-theme", next); } catch (e) {}
    });
  }

  var navBtn = document.getElementById("navToggle");
  if (navBtn) {
    navBtn.addEventListener("click", function () {
      var side = document.querySelector(".side");
      if (side) side.classList.toggle("collapsed");
    });
  }

  /* ------------------------------------------------- table of contents -- */

  var tocLinks = [].slice.call(document.querySelectorAll(".toc a"));
  if (tocLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var visible = new Set();
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) visible.add(en.target.id);
        else visible.delete(en.target.id);
      });
      var first = null;
      for (var i = 0; i < tocLinks.length; i++) {
        var id = tocLinks[i].getAttribute("href").slice(1);
        if (visible.has(id)) { first = id; break; }
      }
      tocLinks.forEach(function (a) {
        a.classList.toggle("on", a.getAttribute("href").slice(1) === first);
      });
    }, { rootMargin: "-70px 0px -70% 0px" });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) obs.observe(el);
    });
  }

  /* --------------------------------------------------- evidence-log ---- */

  var log = document.getElementById("evidence");
  if (log) {
    var cards = [].slice.call(log.querySelectorAll(".finding"));
    var buttons = [].slice.call(document.querySelectorAll(".filters button[data-filter]"));
    var counter = document.querySelector(".filters .count");
    var active = { status: null, tag: null };

    function apply() {
      var n = 0;
      cards.forEach(function (c) {
        var okS = !active.status || c.dataset.status === active.status;
        var okT = !active.tag || (" " + c.dataset.tags + " ").indexOf(" " + active.tag + " ") >= 0;
        var show = okS && okT;
        c.classList.toggle("hidden", !show);
        if (show) n++;
      });
      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(active[b.dataset.kind] === b.dataset.filter));
      });
      if (counter) {
        counter.textContent = n === cards.length
          ? cards.length + " findings"
          : n + " of " + cards.length + " findings";
      }
      if (history.replaceState) {
        var q = [];
        if (active.status) q.push("status=" + active.status);
        if (active.tag) q.push("tag=" + active.tag);
        history.replaceState(null, "", q.length ? "?" + q.join("&") : location.pathname);
      }
    }

    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.dataset.kind;
        active[k] = active[k] === b.dataset.filter ? null : b.dataset.filter;
        apply();
      });
    });
    log.addEventListener("click", function (ev) {
      var t = ev.target.closest(".chip.tag");
      if (!t) return;
      active.tag = active.tag === t.dataset.tag ? null : t.dataset.tag;
      apply();
      window.scrollTo({ top: log.offsetTop - 90 });
    });

    var params = new URLSearchParams(location.search);
    active.status = params.get("status");
    active.tag = params.get("tag");
    apply();
  }

  /* -------------------------------------------------------------- search -- */

  var wrap = document.getElementById("search");
  var input = document.getElementById("searchInput");
  var results = document.getElementById("searchResults");
  var index = window.__SEARCH__ || [];
  var sel = -1;

  function open() {
    if (!wrap) return;
    wrap.setAttribute("open", "");
    input.value = "";
    render([]);
    input.focus();
  }
  function close() { if (wrap) wrap.removeAttribute("open"); }

  function esc(s) {
    return s.replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
  }

  function render(hits) {
    if (!results) return;
    sel = -1;
    if (!hits.length) {
      results.innerHTML = input && input.value.trim()
        ? '<div class="empty">Nothing matches.</div>'
        : '<div class="empty">Search titles, headings and body text.</div>';
      return;
    }
    results.innerHTML = hits.map(function (h) {
      return '<a href="' + h.url + '">' +
             '<div class="rq">' + esc(h.quadrant) + "</div>" +
             '<div class="rt">' + esc(h.title) + "</div>" +
             '<div class="rx">' + h.excerpt + "</div></a>";
    }).join("");
  }

  function search(qs) {
    var terms = qs.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    var hits = [];
    for (var i = 0; i < index.length; i++) {
      var d = index[i];
      var hay = d.h.toLowerCase();
      var score = 0, ok = true;
      for (var t = 0; t < terms.length; t++) {
        var term = terms[t];
        var inTitle = d.t.toLowerCase().indexOf(term) >= 0;
        var at = hay.indexOf(term);
        if (!inTitle && at < 0) { ok = false; break; }
        score += inTitle ? 12 : 0;
        score += at >= 0 ? 3 : 0;
        if (at >= 0 && at < 400) score += 1;
      }
      if (!ok) continue;
      var at0 = hay.indexOf(terms[0]);
      var start = Math.max(0, at0 - 60);
      var raw = at0 < 0 ? d.h.slice(0, 150) : d.h.slice(start, start + 170);
      var ex = esc(raw);
      terms.forEach(function (term) {
        ex = ex.replace(new RegExp("(" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"),
                        "<mark>$1</mark>");
      });
      hits.push({ url: d.u, title: d.t, quadrant: d.q, excerpt: (start ? "…" : "") + ex + "…", score: score });
    }
    hits.sort(function (a, b) { return b.score - a.score; });
    return hits.slice(0, 12);
  }

  if (input) {
    input.addEventListener("input", function () { render(search(input.value)); });
    input.addEventListener("keydown", function (ev) {
      var items = [].slice.call(results.querySelectorAll("a"));
      if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
        ev.preventDefault();
        if (!items.length) return;
        if (sel >= 0) items[sel].classList.remove("sel");
        sel = (sel + (ev.key === "ArrowDown" ? 1 : items.length - 1)) % items.length;
        items[sel].classList.add("sel");
        items[sel].scrollIntoView({ block: "nearest" });
      } else if (ev.key === "Enter") {
        if (sel >= 0 && items[sel]) { ev.preventDefault(); items[sel].click(); }
        else if (items.length) { ev.preventDefault(); items[0].click(); }
      }
    });
  }
  [].slice.call(document.querySelectorAll("[data-open-search]")).forEach(function (b) {
    b.addEventListener("click", open);
  });
  if (wrap) {
    wrap.querySelector(".veil").addEventListener("click", close);
  }
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") close();
    if ((ev.key === "/" || (ev.key === "k" && (ev.metaKey || ev.ctrlKey))) &&
        !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      ev.preventDefault();
      open();
    }
  });
})();
