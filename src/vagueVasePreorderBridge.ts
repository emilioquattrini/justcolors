import content from '@/data/vague-vase.json';
import './pages/VagueVaseReservationBridge.css';

type ReservationResponse = {
  success?: boolean;
  error?: string;
  referenceCode?: string;
  createdAt?: string;
  duplicate?: boolean;
};

const formSelector = '.vv-dialog-panel';
const tokenStorageKey = 'justcolors-vaguevase-reservation-token';
let formStartedAt = new Date().toISOString();

const createUuid = () => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));

  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
};

const getSubmissionToken = () => {
  try {
    const existing = window.sessionStorage.getItem(tokenStorageKey);
    if (existing) return existing;

    const created = createUuid();
    window.sessionStorage.setItem(tokenStorageKey, created);
    return created;
  } catch {
    return createUuid();
  }
};

const clearSubmissionToken = () => {
  try {
    window.sessionStorage.removeItem(tokenStorageKey);
  } catch {
    // The reservation is already stored; session storage is optional.
  }
};

const getFormError = (form: HTMLFormElement) => {
  const existing = form.querySelector<HTMLParagraphElement>('.vv-form-error');
  if (existing) return existing;

  const error = document.createElement('p');
  error.className = 'vv-form-error';
  error.setAttribute('role', 'alert');
  error.setAttribute('aria-live', 'polite');
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  form.insertBefore(error, submit ?? null);
  return error;
};

const setError = (form: HTMLFormElement, message: string) => {
  const error = getFormError(form);
  error.textContent = message;
  error.hidden = message.length === 0;
};

const enhanceReservationForm = () => {
  const form = document.querySelector<HTMLFormElement>(formSelector);
  if (!form || form.dataset.directReservationEnhanced === 'true') return;

  form.dataset.directReservationEnhanced = 'true';

  const honeypot = document.createElement('label');
  honeypot.className = 'vv-honeypot';
  honeypot.setAttribute('aria-hidden', 'true');

  const honeypotLabel = document.createElement('span');
  honeypotLabel.textContent = 'Website';

  const honeypotInput = document.createElement('input');
  honeypotInput.type = 'text';
  honeypotInput.name = 'website';
  honeypotInput.tabIndex = -1;
  honeypotInput.autocomplete = 'off';

  honeypot.append(honeypotLabel, honeypotInput);
  form.appendChild(honeypot);

  const consent = form.querySelector<HTMLElement>('.vv-consent');
  const legacyPrivacyLink = consent?.querySelector<HTMLAnchorElement>('a');
  legacyPrivacyLink?.remove();

  if (consent && !form.querySelector('.vv-privacy-details')) {
    const details = document.createElement('details');
    details.className = 'vv-privacy-details';

    const summary = document.createElement('summary');
    summary.textContent = content.dialog.privacyLabel;

    const privacyText = document.createElement('p');
    privacyText.textContent = content.dialog.privacyText;

    details.append(summary, privacyText);
    consent.insertAdjacentElement('afterend', details);
  }
};

const syncDialogState = () => {
  enhanceReservationForm();

  const dialog = document.querySelector<HTMLDialogElement>('.vv-dialog');
  if (!dialog) return;

  if (dialog.open && dialog.dataset.directReservationOpen !== 'true') {
    dialog.dataset.directReservationOpen = 'true';
    formStartedAt = new Date().toISOString();
  } else if (!dialog.open) {
    delete dialog.dataset.directReservationOpen;
  }
};

const showSuccess = (
  form: HTMLFormElement,
  referenceCode: string,
) => {
  const closeIcon = document.createElement('button');
  closeIcon.className = 'vv-dialog-close';
  closeIcon.type = 'button';
  closeIcon.setAttribute('aria-label', content.dialog.closeLabel);
  closeIcon.textContent = '×';

  const success = document.createElement('div');
  success.className = 'vv-reservation-success';
  success.setAttribute('role', 'status');
  success.setAttribute('aria-live', 'polite');

  const mark = document.createElement('span');
  mark.className = 'vv-reservation-success-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = '✓';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'vv-eyebrow';
  eyebrow.textContent = content.dialog.successEyebrow;

  const title = document.createElement('h2');
  title.id = 'vv-dialog-title';
  title.tabIndex = -1;
  title.textContent = content.dialog.successTitle;

  const body = document.createElement('p');
  body.className = 'vv-reservation-success-copy';
  body.textContent = content.dialog.successBody;

  const referenceLabel = document.createElement('p');
  referenceLabel.className = 'vv-reservation-reference-label';
  referenceLabel.textContent = content.dialog.successReferenceLabel;

  const reference = document.createElement('strong');
  reference.className = 'vv-reservation-reference';
  reference.textContent = referenceCode;

  const closeButton = document.createElement('button');
  closeButton.className = 'vv-button vv-button-dark vv-reservation-success-button';
  closeButton.type = 'button';
  closeButton.textContent = content.dialog.successCloseLabel;

  const closeDialog = () => {
    const dialog = form.closest<HTMLDialogElement>('dialog');
    dialog?.close();
    document.body.classList.remove('vv-dialog-open');
  };

  closeIcon.addEventListener('click', closeDialog);
  closeButton.addEventListener('click', closeDialog);

  success.append(
    mark,
    eyebrow,
    title,
    body,
    referenceLabel,
    reference,
    closeButton,
  );
  form.replaceChildren(closeIcon, success);
  title.focus();
};

const readTracking = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') ?? '',
    utmMedium: params.get('utm_medium') ?? '',
    utmCampaign: params.get('utm_campaign') ?? '',
    utmContent: params.get('utm_content') ?? '',
  };
};

const handleReservationSubmit = async (event: SubmitEvent) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.matches(formSelector)) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  if (!form.reportValidity()) return;

  const nameInput = form.querySelector<HTMLInputElement>('input[autocomplete="name"]');
  const emailInput = form.querySelector<HTMLInputElement>('input[type="email"]');
  const phoneInput = form.querySelector<HTMLInputElement>('input[type="tel"]');
  const countryInput = form.querySelector<HTMLInputElement>('input[autocomplete="country-name"]');
  const versionSelect = form.querySelector<HTMLSelectElement>('.vv-form-version select');
  const quantitySelect = Array.from(form.querySelectorAll<HTMLSelectElement>('select'))
    .find((select) => select !== versionSelect);
  const notesInput = form.querySelector<HTMLTextAreaElement>('textarea');
  const consentInput = form.querySelector<HTMLInputElement>('.vv-consent input[type="checkbox"]');
  const honeypotInput = form.querySelector<HTMLInputElement>('input[name="website"]');
  const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  if (
    !nameInput ||
    !emailInput ||
    !versionSelect ||
    !quantitySelect ||
    !consentInput ||
    !submitButton
  ) {
    setError(form, content.dialog.errorFallback);
    return;
  }

  const selectedVariant = content.preorder.variants.find(
    (variant) => variant.value === versionSelect.value,
  );
  if (!selectedVariant) {
    setError(form, content.dialog.invalidVersionError);
    return;
  }

  setError(form, '');
  form.setAttribute('aria-busy', 'true');
  submitButton.disabled = true;
  const originalButtonMarkup = submitButton.innerHTML;
  submitButton.textContent = content.dialog.submittingLabel;

  const timeoutController = new AbortController();
  const timeoutId = window.setTimeout(() => timeoutController.abort(), 15_000);

  try {
    const response = await fetch(content.preorder.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: timeoutController.signal,
      body: JSON.stringify({
        submissionToken: getSubmissionToken(),
        fullName: nameInput.value,
        email: emailInput.value,
        phone: phoneInput?.value ?? '',
        countryCity: countryInput?.value ?? '',
        version: versionSelect.value,
        quantity: Number.parseInt(quantitySelect.value, 10),
        notes: notesInput?.value ?? '',
        consent: consentInput.checked,
        consentAt: new Date().toISOString(),
        formStartedAt,
        website: honeypotInput?.value ?? '',
        landingUrl: window.location.href,
        referrer: document.referrer,
        locale: navigator.language,
        pageVersion: content.preorder.pageVersion,
        tracking: readTracking(),
      }),
    });

    const result = (await response.json().catch(() => ({}))) as ReservationResponse;
    if (!response.ok || result.success !== true) {
      throw new Error(result.error || content.dialog.errorFallback);
    }

    clearSubmissionToken();
    showSuccess(form, result.referenceCode || 'VV-RECEIVED');
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === 'AbortError'
        ? content.dialog.timeoutError
        : error instanceof Error
          ? error.message
          : content.dialog.errorFallback;

    setError(form, message);
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonMarkup;
    form.removeAttribute('aria-busy');
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const startBridge = () => {
  syncDialogState();

  const observer = new MutationObserver(syncDialogState);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['open'],
  });

  document.addEventListener('submit', handleReservationSubmit, true);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startBridge, { once: true });
} else {
  startBridge();
}
