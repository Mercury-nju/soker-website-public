/* Multi-step recruitment prototype. No personal data is stored or transmitted. */
(() => {
  'use strict';
  const root = document.getElementById('soker-beta');
  const intro = root.querySelector('#reservation-intro');
  const application = root.querySelector('#reservation-application');
  const result = root.querySelector('#application-result');
  const form = root.querySelector('#soker-beta-form');
  const need = root.querySelector('#beta-need');
  const otherField = root.querySelector('#beta-other-field');
  const otherCategory = root.querySelector('#beta-other');
  const phone = root.querySelector('#beta-phone');
  const steps = [...form.querySelectorAll('[data-step]')];
  const labels = {
    automotive: '汽车销售',
    property: '房产销售',
    renovation: '家装建材',
    insurance: '保险销售',
    education: '教育培训',
    business: '企业服务',
    other: '其他',
  };
  let stage = 'intro';

  function show(next) {
    stage = next;
    intro.hidden = next !== 'intro';
    application.hidden = !['details', 'phone'].includes(next);
    result.hidden = next !== 'complete';
    for (const step of steps) {
      step.hidden = step.dataset.step !== next;
      step.disabled = step.hidden;
    }
    for (const item of root.querySelectorAll('[data-stage]')) {
      if (item.dataset.stage === next) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
      item.dataset.complete = String(next === 'phone' && item.dataset.stage === 'details');
    }
    const headingId = {
      intro: 'beta-title',
      details: 'reservation-details-title',
      phone: 'reservation-phone-title',
      complete: 'reservation-result-title',
    }[next];
    root.setAttribute('aria-labelledby', headingId);
    if (!application.hidden) application.setAttribute('aria-labelledby', headingId);
    root.scrollTop = 0;
    root.querySelector('#' + headingId).focus({ preventScroll: true });
  }

  function validDetails() {
    const selected = form.querySelector('input[name="identity"]:checked');
    if (!selected) {
      form.querySelector('input[name="identity"]').reportValidity();
      return false;
    }
    if (selected.value === 'other') {
      otherCategory.setCustomValidity(otherCategory.value.trim() ? '' : '请填写你的销售类别。');
      if (!otherCategory.reportValidity()) return false;
    }
    need.setCustomValidity(need.value.trim() ? '' : '请简单说说你希望解决的需求。');
    return need.reportValidity();
  }

  root.querySelector('#reservation-start').addEventListener('click', () => show('details'));
  root.querySelector('#reservation-close').addEventListener('click', () => show('intro'));
  root.querySelectorAll('[data-reservation-back]').forEach(button => {
    button.addEventListener('click', () => show(button.dataset.reservationBack));
  });
  form.querySelectorAll('input[name="identity"]').forEach(input => {
    input.addEventListener('change', () => {
      const isOther = input.value === 'other';
      otherField.hidden = !isOther;
      otherCategory.disabled = !isOther;
      otherCategory.required = isOther;
      otherCategory.setCustomValidity('');
      if (isOther) otherCategory.focus();
    });
  });
  otherCategory.addEventListener('input', () => otherCategory.setCustomValidity(''));
  need.addEventListener('input', () => need.setCustomValidity(''));
  phone.addEventListener('input', () => phone.setCustomValidity(''));

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (stage === 'details') {
      if (validDetails()) show('phone');
      return;
    }
    if (stage !== 'phone') return;
    phone.setCustomValidity(/^1\d{10}$/.test(phone.value.trim()) ? '' : '请输入有效的 11 位手机号码。');
    if (!phone.reportValidity()) return;
    // Revalidate the earlier step before displaying the preview result.
    steps.find(step => step.dataset.step === 'details').disabled = false;
    if (!validDetails()) { show('details'); return; }
    const identity = form.querySelector('input[name="identity"]:checked').value;
    root.querySelector('#reservation-result-identity').textContent = identity === 'other' ? otherCategory.value.trim() : labels[identity];
    root.querySelector('#reservation-result-need').textContent = need.value.trim();
    root.querySelector('#reservation-result-phone').textContent = phone.value.trim();
    show('complete');
  });
  root.querySelector('#edit-draft').addEventListener('click', () => show('details'));
})();
