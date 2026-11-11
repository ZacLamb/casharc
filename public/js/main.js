(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };

  // ---- Mobile nav
  var toggle = $('.nav-toggle'), menu = $('#nav-menu');
  if (toggle) toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  // ---- Save UTM / click IDs for the session so they ride along with the lead
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
  try {
    var qs = new URLSearchParams(location.search);
    KEYS.forEach(function (k) { if (qs.get(k)) sessionStorage.setItem(k, qs.get(k)); });
  } catch (e) {}

  // ---- Sticky mobile CTA (hidden on pages that already have a form)
  var mcta = $('.mobile-cta');
  if ($('#applyForm') || $('#contactForm')) document.body.classList.add('no-mcta');
  else if (mcta) window.addEventListener('scroll', function () {
    mcta.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });

  // ---- Funding estimator
  var rev = $('#rev');
  if (rev) {
    var tib = $('#tib'), revOut = $('#revOut'), estOut = $('#estOut'), estAmt = $('#estAmount');
    var factors = { 'lt6': [0.25, 0.6], '6-12': [0.4, 1], '1-2': [0.5, 1.5], '2+': [0.6, 1.75] };
    var round = function (n) { return Math.round(n / 1000) * 1000; };
    var update = function () {
      var r = +rev.value, f = factors[tib.value] || factors['1-2'];
      var lo = Math.max(5000, round(r * f[0])), hi = Math.min(250000, round(r * f[1]));
      if (lo > hi) lo = hi;
      revOut.textContent = money(r) + (r >= 300000 ? '+' : '');
      estOut.textContent = money(lo) + ' – ' + money(hi) + (hi >= 250000 ? '+' : '');
      estAmt.value = hi;
      var pct = (r - rev.min) / (rev.max - rev.min) * 100;
      rev.style.background = 'linear-gradient(90deg,#2563eb ' + pct + '%,#e2e8f0 ' + pct + '%)';
    };
    rev.addEventListener('input', update);
    tib.addEventListener('change', update);
    update();
  }

  // ---- Phone formatting
  $$('input[type=tel]').forEach(function (el) {
    el.addEventListener('input', function () {
      var d = el.value.replace(/\D/g, '').replace(/^1/, '').slice(0, 10);
      el.value = d.length > 6 ? '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6)
        : d.length > 3 ? '(' + d.slice(0, 3) + ') ' + d.slice(3) : d;
    });
  });

  var validate = function (scope) {
    var ok = true, first = null;
    $$('[required]', scope).forEach(function (el) {
      var bad;
      if (el.type === 'radio') bad = !$('input[name="' + el.name + '"]:checked', scope);
      else if (el.type === 'checkbox') bad = !el.checked;
      else if (el.type === 'email') bad = !/^\S+@\S+\.\S+$/.test(el.value);
      else if (el.type === 'tel') bad = el.value.replace(/\D/g, '').length < 10;
      else bad = !el.value.trim();
      var target = el.type === 'radio' ? el.closest('.chips') : el;
      if (target) target.classList.toggle('invalid', bad);
      if (bad) { ok = false; first = first || el; }
    });
    return { ok: ok, first: first };
  };

  var submitLead = function (form, btn, errEl) {
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    data.consent = !!$('input[name=consent]', form) && $('input[name=consent]', form).checked;
    data.pageUrl = location.href;
    KEYS.forEach(function (k) { try { data[k] = sessionStorage.getItem(k) || ''; } catch (e) {} });
    var label = btn.innerHTML;
    btn.disabled = true; btn.textContent = 'Sending…';
    errEl.hidden = true;
    fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.j.error || 'Something went wrong.');
        location.href = '/thank-you';
      })
      .catch(function (e) {
        errEl.textContent = e.message || 'Something went wrong. Please try again.';
        errEl.hidden = false;
        btn.disabled = false; btn.innerHTML = label;
      });
  };

  // ---- Multi-step application
  var form = $('#applyForm');
  if (form) {
    var steps = $$('.fstep', form), cur = 0;
    var bar = $('#progBar'), count = $('#stepCount');
    var show = function (i) {
      steps.forEach(function (s, n) { s.classList.toggle('is-active', n === i); });
      cur = i;
      bar.style.width = ((i + 1) / steps.length * 100) + '%';
      count.textContent = 'Step ' + (i + 1) + ' of ' + steps.length;
      if (i > 0) { var f = $('input:not([type=radio]),select', steps[i]); if (f) f.focus({ preventScroll: true }); }
      if (form.getBoundingClientRect().top < 0) form.scrollIntoView({ behavior: 'smooth' });
    };
    $$('[data-next]', form).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = validate(steps[cur]);
        if (!v.ok) { if (v.first && v.first.focus) v.first.focus(); return; }
        if (window.gtag) gtag('event', 'apply_step', { step: cur + 2 });
        show(cur + 1);
      });
    });
    $$('[data-back]', form).forEach(function (b) { b.addEventListener('click', function () { show(cur - 1); }); });
    // Auto-advance after picking an amount
    $$('input[name=amount]', form).forEach(function (r) {
      r.addEventListener('change', function () { $('.chips', form).classList.remove('invalid'); });
    });

    // Prefill from the homepage estimator
    var amt = +form.dataset.prefillAmount || 0, rv = +form.dataset.prefillRevenue || 0;
    if (amt) {
      var idx = amt <= 25000 ? 0 : amt <= 50000 ? 1 : amt <= 100000 ? 2 : 3;
      var radios = $$('input[name=amount]', form); if (radios[idx]) radios[idx].checked = true;
    }
    if (rv) {
      var opt = $$('#revenue option[data-max]', form).find(function (o) { return rv <= +o.dataset.max; });
      if (opt) opt.selected = true;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = validate(steps[cur]);
      if (!v.ok) { if (v.first && v.first.focus) v.first.focus(); return; }
      submitLead(form, $('#submitBtn'), $('#formError'));
    });
  }

  // ---- Contact form
  var cf = $('#contactForm');
  if (cf) cf.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = validate(cf);
    if (!v.ok) { if (v.first && v.first.focus) v.first.focus(); return; }
    submitLead(cf, $('button[type=submit]', cf), $('.form-error', cf));
  });
})();
