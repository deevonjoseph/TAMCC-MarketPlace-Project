(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function money(n) {
    return "XCD " + n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /* ---- the one authored moment: prices rewrite in ballpoint ---- */
  var sort = document.getElementById("sort");
  var listings = document.getElementById("listings");

  if (sort && listings) {
    sort.addEventListener("change", function () {
      var cards = Array.prototype.slice.call(listings.querySelectorAll(".listing"));
      var mode = sort.value;

      cards.sort(function (a, b) {
        var pa = Number(a.dataset.price);
        var pb = Number(b.dataset.price);
        if (mode === "low") return pa - pb;
        if (mode === "high") return pb - pa;
        return Number(b.dataset.new) - Number(a.dataset.new);
      });

      cards.forEach(function (card) { listings.appendChild(card); });

      if (reduce) return;
      cards.forEach(function (card, i) {
        var el = card.querySelector(".price");
        if (!el) return;
        window.setTimeout(function () {
          el.classList.remove("rewriting");
          void el.offsetWidth;
          el.classList.add("rewriting");
        }, i * 70);
      });
    });
  }

  /* ---- filters, with an empty state ---- */
  var form = document.getElementById("filter-form");
  var empty = document.getElementById("empty-state");
  var count = document.getElementById("result-count");

  function applyFilters() {
    if (!form || !listings) return;
    var cats = Array.prototype.slice
      .call(form.querySelectorAll('input[name="cat"]:checked'))
      .map(function (c) { return c.value; });
    var min = Number(document.getElementById("min-price").value) || 0;
    var max = Number(document.getElementById("max-price").value);
    if (isNaN(max)) max = Infinity;

    var shown = 0;
    Array.prototype.forEach.call(listings.querySelectorAll(".listing"), function (card) {
      var ok = cats.indexOf(card.dataset.cat) !== -1 &&
        Number(card.dataset.price) >= min &&
        Number(card.dataset.price) <= max;
      card.hidden = !ok;
      if (ok) shown++;
    });

    if (count) count.textContent = String(shown);
    if (empty) empty.hidden = shown !== 0;
    listings.hidden = shown === 0;
  }

  if (form) {
    form.addEventListener("submit", function (e) { e.preventDefault(); applyFilters(); });
    form.addEventListener("reset", function () {
      window.setTimeout(applyFilters, 0);
    });
  }
  var clear = document.getElementById("clear-filters");
  if (clear && form) {
    clear.addEventListener("click", function () {
      form.querySelectorAll('input[name="cat"]').forEach(function (c) { c.checked = true; });
      document.getElementById("min-price").value = "0";
      document.getElementById("max-price").value = "1500";
      applyFilters();
    });
  }

  /* ---- listing form: validation and confirmation ---- */
  var listingForm = document.getElementById("listing-form");
  if (listingForm) {
    listingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var price = document.getElementById("f-price");
      var field = price.closest(".field");
      var toast = document.getElementById("publish-toast");
      var value = Number(price.value);

      if (!(value > 0)) {
        field.classList.add("error");
        price.setAttribute("aria-invalid", "true");
        price.focus();
        if (toast) toast.hidden = true;
        return;
      }
      field.classList.remove("error");
      price.removeAttribute("aria-invalid");
      if (toast) toast.hidden = false;
    });
  }

  /* ---- sign in: the demo error clears once the field changes ---- */
  var signin = document.getElementById("signin-form");
  if (signin) {
    var banner = signin.parentNode.querySelector(".banner");
    signin.addEventListener("input", function () {
      if (banner) banner.hidden = true;
    });
    signin.addEventListener("submit", function (e) { e.preventDefault(); });
  }

  /* ---- moderator queue ---- */
  var queueBody = document.getElementById("queue-body");
  var queueStatus = document.getElementById("queue-status");
  if (queueBody) {
    queueBody.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-decide]");
      if (!btn) return;
      var row = btn.closest("tr");
      var item = row.querySelector(".item").textContent;
      var action = btn.dataset.decide === "hide" ? "hidden" : "restored";
      row.style.opacity = ".45";
      row.querySelectorAll("button").forEach(function (b) { b.disabled = true; });
      if (queueStatus) {
        queueStatus.lastChild.textContent =
          " " + item + " " + action + ". The decision was written with your account and today's date.";
      }
    });
  }

  var record = document.getElementById("record-decision");
  if (record) {
    record.addEventListener("click", function () {
      var reason = document.getElementById("f-reason");
      if (!reason.value.trim()) {
        reason.focus();
        reason.style.borderColor = "var(--stamp)";
        return;
      }
      reason.style.borderColor = "";
      if (queueStatus) {
        queueStatus.lastChild.textContent =
          " Decision recorded with the reason, your account and the date.";
      }
    });
  }

  /* ---- running head marks the screen you are reading ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".running nav a"));
  var targets = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && targets.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.setAttribute("aria-current",
            a.getAttribute("href") === "#" + entry.target.id ? "true" : "false");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---- status stamps press once, when the browse screen is reached ---- */
  var stamps = document.querySelectorAll("[data-stamp]");
  if (stamps.length && "IntersectionObserver" in window && !reduce) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("press");
        so.unobserve(entry.target);
      });
    }, { threshold: .9 });
    stamps.forEach(function (s) { so.observe(s); });
  }
})();
