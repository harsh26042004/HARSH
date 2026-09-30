// UI logic. Each feature is its own small function so it is easy to change or remove.
const D = window.PORTFOLIO;
const $ = (s, el = document) => el.querySelector(s);
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html) n.innerHTML = html; return n; };

function typedLines() {                       // hero typing effect
  const box = $('#typed-line'); let li = 0, ci = 0, del = false;
  (function step() {
    const line = D.typedLines[li];
    ci += del ? -1 : 1;
    box.textContent = line.slice(0, ci);
    let wait = del ? 25 : 45;
    if (!del && ci === line.length) { del = true; wait = 1800; }
    else if (del && ci === 0) { del = false; li = (li + 1) % D.typedLines.length; wait = 400; }
    setTimeout(step, wait);
  })();
}

function stats() {                            // counters animate when visible
  const box = $('#stats');
  D.stats.forEach(s => box.append(el('div', 'stat', `<b data-to="${s.value}" data-suffix="${s.suffix}">0</b><span>${s.label}</span>`)));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const n = e.target, to = +n.dataset.to, t0 = performance.now();
    (function f(t) { const p = Math.min(1, (t - t0) / 1200); n.textContent = Math.round(to * p) + n.dataset.suffix; if (p < 1) requestAnimationFrame(f); })(t0);
  }), { threshold: .6 });
  box.querySelectorAll('b').forEach(b => io.observe(b));
}

function skills() {                           // filter tabs
  const tabs = $('#skill-tabs'), chips = $('#skill-chips');
  const show = name => {
    tabs.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected', t.textContent === name));
    chips.replaceChildren(...D.skills[name].map(s => el('span', 'chip', s)));
  };
  Object.keys(D.skills).forEach(name => { const b = el('button', 'tab', name); b.setAttribute('role', 'tab'); b.onclick = () => show(name); tabs.append(b); });
  show(Object.keys(D.skills)[0]);
}

function timeline() {                         // expandable roles
  const box = $('#timeline');
  D.jobs.forEach((j, i) => {
    const job = el('div', 'job' + (i === 0 ? ' open' : ''));
    job.innerHTML = `<button aria-expanded="${i === 0}"><h3>${j.role}</h3><small>${j.org} · ${j.when}</small></button><ul>${j.points.map(p => `<li>${p}</li>`).join('')}</ul>`;
    job.querySelector('button').onclick = e => { const o = job.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); };
    box.append(job);
  });
}

function education() { D.education.forEach(e => $('#edu-cards').append(el('div', 'card tilt', `<h3>${e.title}</h3><p>${e.sub}</p>`))); }

function contactInfo() {
  const c = D.contact;
  $('#contact-info').innerHTML = `<p>Looking for a property in Mathura–Vrindavan, or a marketing partner? Send a message or reach me directly.</p>
    <a href="tel:+91${c.phone}">${c.phone}</a><a href="mailto:${c.email}">${c.email}</a>
    <a href="${c.whatsapp}" target="_blank" rel="noopener">Chat on WhatsApp</a><a href="${c.site}" target="_blank" rel="noopener">mediaonstake.com</a>`;
}

function tilt() {                             // 3D card tilt on hover
  document.querySelectorAll('.tilt').forEach(n => {
    n.style.transition = 'transform .15s';
    n.addEventListener('pointermove', e => {
      const r = n.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      n.style.transform = `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.03)`;
    });
    n.addEventListener('pointerleave', () => n.style.transform = '');
  });
}

function magnetic() {                         // buttons lean toward the cursor
  document.querySelectorAll('.magnetic').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`; });
    b.addEventListener('pointerleave', () => b.style.transform = '');
  });
}

function scrollFx() {                         // progress bar + heading reveal
  const bar = $('#progress');
  addEventListener('scroll', () => bar.style.width = scrollY / (document.body.scrollHeight - innerHeight) * 100 + '%', { passive: true });
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: .2 });
  document.querySelectorAll('.section h2').forEach(h => { h.classList.add('reveal'); io.observe(h); });
}

function form() {                             // posts to backend /api/contact
  const f = $('#contact-form'), status = $('#form-status');
  f.addEventListener('submit', async e => {
    e.preventDefault(); status.className = ''; status.textContent = 'Sending...';
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(f))) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      f.reset(); status.className = 'ok'; status.textContent = 'Message sent. I will reply soon.';
    } catch (err) { status.className = 'err'; status.textContent = err.message || 'Could not send. Please try WhatsApp instead.'; }
  });
}

$('#about-text').textContent = D.about;
$('#year').textContent = new Date().getFullYear();
[typedLines, stats, skills, timeline, education, contactInfo, scrollFx, form].forEach(fn => fn());
tilt(); magnetic();
