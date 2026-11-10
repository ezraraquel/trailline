// Sends the support form to the Trailline relay Worker, which emails support@trytrailline.app.
(() => {
  const ENDPOINT = 'https://trailline-support.WORKERS_SUBDOMAIN.workers.dev';
  const form = document.getElementById('support-form');
  if (!form) return;
  if (ENDPOINT.includes('WORKERS_SUBDOMAIN')) {
    // Relay not deployed yet: keep the page honest instead of failing on submit.
    form.querySelectorAll('input, select, textarea, button').forEach((el) => { el.disabled = true; });
    form.querySelector('.form-status').textContent = 'The contact form is being set up. Check back soon.';
    return;
  }
  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type=submit]');
  const say = (text, kind) => { status.textContent = text; status.className = `form-status ${kind || ''}`; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')) return say('Please enter a valid email so we can reply.', 'err');
    if ((data.message || '').trim().length < 5) return say('Please add a message.', 'err');
    button.disabled = true;
    say('Sending…');
    try {
      const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Could not send right now.');
      form.reset();
      say("Thanks! Your message is on its way. We'll reply by email.", 'ok');
    } catch (err) {
      say(`${err.message} You can also email support@trytrailline.app.`, 'err');
    } finally {
      button.disabled = false;
    }
  });
})();
