import { useEffect, useRef, useState } from 'react';
import type { FormEvent, MouseEvent as ReactMouseEvent } from 'react';
import {
  ArrowRight,
  Check,
  ExternalLink,
  Instagram,
  Mail,
  Menu,
  X,
} from 'lucide-react';
import content from '@/data/vague-vase.json';
import './VagueVasePage.css';
import './VagueVaseReservation.css';

type ReservationResponse = {
  success?: boolean;
  error?: string;
  referenceCode?: string;
  createdAt?: string;
  duplicate?: boolean;
};

const createUuid = () => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  );

  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
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

const VagueVasePage = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formStartedAtRef = useRef(new Date().toISOString());
  const submissionTokenRef = useRef('');

  const [menuOpen, setMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [reservationReference, setReservationReference] = useState('');
  const [selectedVersion, setSelectedVersion] = useState(
    content.preorder.variants[0]?.value ?? '',
  );
  const [quantity, setQuantity] = useState('1');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');

  useEffect(() => {
    const previousTitle = document.title;
    const existingDescription = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const previousDescription = existingDescription?.content ?? '';
    const descriptionMeta =
      existingDescription ?? document.createElement('meta');
    const createdDescription = existingDescription === null;

    document.title = content.seo.title;
    descriptionMeta.name = 'description';
    descriptionMeta.content = content.seo.description;

    if (createdDescription) {
      document.head.appendChild(descriptionMeta);
    }

    window.scrollTo({ top: 0, behavior: 'auto' });

    return () => {
      document.title = previousTitle;
      document.body.classList.remove('vv-dialog-open');

      if (createdDescription) {
        descriptionMeta.remove();
      } else {
        descriptionMeta.content = previousDescription;
      }
    };
  }, []);

  const scrollToSection = (target: string) => {
    document
      .getElementById(`vv-${target}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  const resetReservationForm = () => {
    setSelectedVersion(content.preorder.variants[0]?.value ?? '');
    setQuantity('1');
    setName('');
    setEmail('');
    setPhone('');
    setCountry('');
    setNotes('');
    setConsent(false);
    setWebsite('');
    setFormError('');
    setReservationReference('');
    submissionTokenRef.current = '';
  };

  const openPreorder = () => {
    setFormError('');
    formStartedAtRef.current = new Date().toISOString();

    if (!submissionTokenRef.current) {
      submissionTokenRef.current = createUuid();
    }

    dialogRef.current?.showModal();
    document.body.classList.add('vv-dialog-open');
  };

  const closePreorder = () => {
    dialogRef.current?.close();
    document.body.classList.remove('vv-dialog-open');
    setSubmitting(false);

    if (reservationReference) {
      resetReservationForm();
    }
  };

  const handleDialogBackdrop = (
    event: ReactMouseEvent<HTMLDialogElement>,
  ) => {
    if (event.target === dialogRef.current) {
      closePreorder();
    }
  };

  const handlePreorder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    const variant = content.preorder.variants.find(
      (item) => item.value === selectedVersion,
    );

    if (!variant) {
      setFormError(content.dialog.invalidVersionError);
      return;
    }

    if (!consent) {
      setFormError(content.dialog.consentError);
      return;
    }

    const parsedQuantity = Number.parseInt(quantity, 10);
    const safeQuantity = Number.isNaN(parsedQuantity)
      ? 1
      : Math.min(Math.max(parsedQuantity, 1), 10);

    if (!submissionTokenRef.current) {
      submissionTokenRef.current = createUuid();
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15_000);

    setSubmitting(true);

    try {
      const response = await fetch(content.preorder.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          submissionToken: submissionTokenRef.current,
          fullName: name,
          email,
          phone,
          countryCity: country,
          product_type: variant.value,
          quantity: safeQuantity,
          notes,
          consent: true,
          consentAt: new Date().toISOString(),
          formStartedAt: formStartedAtRef.current,
          website,
          landingUrl: window.location.href,
          referrer: document.referrer,
          locale: navigator.language,
          pageVersion: content.preorder.pageVersion,
          tracking: readTracking(),
        }),
      });

      const result = (await response
        .json()
        .catch(() => ({}))) as ReservationResponse;

      if (!response.ok || result.success !== true) {
        throw new Error(result.error || content.dialog.errorFallback);
      }

      setReservationReference(result.referenceCode || 'VV-RECEIVED');
      submissionTokenRef.current = '';
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === 'AbortError'
          ? content.dialog.timeoutError
          : error instanceof Error
            ? error.message
            : content.dialog.errorFallback;

      setFormError(message);
    } finally {
      window.clearTimeout(timeoutId);
      setSubmitting(false);
    }
  };

  const renderLogo = (className: string) => {
    if (content.brand.logoImage) {
      return (
        <img
          className={className}
          src={content.brand.logoImage}
          alt={content.brand.logoAlt}
        />
      );
    }

    return <span className={className}>{content.brand.logoText}</span>;
  };

  const renderSocialIcon = (icon: string) => {
    if (icon === 'instagram') {
      return <Instagram aria-hidden="true" />;
    }

    if (icon === 'mail') {
      return <Mail aria-hidden="true" />;
    }

    return <ExternalLink aria-hidden="true" />;
  };

  return (
    <div className="vv-page">
      <header className="vv-header">
        <a className="vv-brand" href={content.brand.homeUrl}>
          {renderLogo('vv-brand-logo')}
          <span className="vv-brand-byline">{content.brand.byline}</span>
        </a>

        <nav className="vv-desktop-nav" aria-label="VagueVase navigation">
          {content.navigation.map((item) => (
            <button
              key={item.target}
              type="button"
              onClick={() => scrollToSection(item.target)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="vv-header-actions">
          <button
            className="vv-button vv-button-small vv-button-dark vv-desktop-preorder"
            type="button"
            onClick={openPreorder}
          >
            {content.hero.primaryCta}
            <ArrowRight aria-hidden="true" />
          </button>
          <button
            className="vv-menu-button"
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </header>

      <div className={`vv-mobile-nav ${menuOpen ? 'is-open' : ''}`}>
        {content.navigation.map((item) => (
          <button
            key={item.target}
            type="button"
            onClick={() => scrollToSection(item.target)}
          >
            {item.label}
          </button>
        ))}
        <button
          className="vv-button vv-button-dark"
          type="button"
          onClick={() => {
            setMenuOpen(false);
            openPreorder();
          }}
        >
          {content.hero.primaryCta}
          <ArrowRight aria-hidden="true" />
        </button>
      </div>

      <main>
        <section className="vv-hero" aria-labelledby="vv-hero-title">
          <div className="vv-hero-copy">
            <p className="vv-eyebrow">{content.hero.eyebrow}</p>
            <h1 id="vv-hero-title">{content.hero.title}</h1>
            <p className="vv-lead">{content.hero.body}</p>
            <div className="vv-button-row">
              <button
                className="vv-button vv-button-rust"
                type="button"
                onClick={openPreorder}
              >
                {content.hero.primaryCta}
                <ArrowRight aria-hidden="true" />
              </button>
              <button
                className="vv-button vv-button-outline"
                type="button"
                onClick={() => scrollToSection(content.collection.id)}
              >
                {content.hero.secondaryCta}
              </button>
            </div>
            <p className="vv-hero-footer-note">{content.hero.footerNote}</p>
          </div>

          <figure className="vv-hero-visual">
            <img
              src={content.hero.image}
              alt={content.hero.imageAlt}
              decoding="async"
            />
            <figcaption>{content.hero.caption}</figcaption>
            <p className="vv-image-note">{content.hero.sideNote}</p>
          </figure>
        </section>

        <section className="vv-split vv-intro" id={`vv-${content.intro.id}`}>
          <figure className="vv-split-media">
            <img
              src={content.intro.image}
              alt={content.intro.imageAlt}
              loading="lazy"
              decoding="async"
            />
            <figcaption>{content.intro.caption}</figcaption>
          </figure>
          <div className="vv-split-copy">
            <p className="vv-eyebrow">{content.intro.eyebrow}</p>
            <h2>{content.intro.title}</h2>
            <p>{content.intro.body}</p>
            <button
              className="vv-text-link"
              type="button"
              onClick={() => scrollToSection(content.intro.linkTarget)}
            >
              {content.intro.linkLabel}
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </section>

        <section
          className="vv-split vv-collection"
          id={`vv-${content.collection.id}`}
        >
          <div className="vv-split-copy">
            <p className="vv-eyebrow">{content.collection.eyebrow}</p>
            <h2>{content.collection.title}</h2>
            <p>{content.collection.body}</p>
            <button
              className="vv-text-link"
              type="button"
              onClick={openPreorder}
            >
              {content.collection.linkLabel}
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
          <figure className="vv-split-media vv-collection-media">
            <img
              src={content.collection.image}
              alt={content.collection.imageAlt}
              loading="lazy"
              decoding="async"
            />
            <p className="vv-image-note vv-image-note-dark">
              {content.collection.sideNote}
            </p>
          </figure>
        </section>

        <section
          className="vv-modular"
          id={`vv-${content.modular.id}`}
        >
          <figure className="vv-modular-media">
            <img
              src={content.modular.image}
              alt={content.modular.imageAlt}
              loading="lazy"
              decoding="async"
            />
          </figure>
          <div className="vv-modular-copy">
            <p className="vv-eyebrow">{content.modular.eyebrow}</p>
            <h2>{content.modular.title}</h2>
            <p>{content.modular.body}</p>
            <button
              className="vv-text-link"
              type="button"
              onClick={openPreorder}
            >
              {content.modular.linkLabel}
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
          <p className="vv-modular-note">{content.modular.note}</p>
        </section>

        <section className="vv-story" id={`vv-${content.story.id}`}>
          <div className="vv-story-copy">
            <p className="vv-eyebrow">{content.story.eyebrow}</p>
            <h2>{content.story.title}</h2>
            <p>{content.story.body}</p>
            <a className="vv-text-link" href={content.story.linkUrl}>
              {content.story.linkLabel}
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
          <figure className="vv-story-media">
            <img
              src={content.story.image}
              alt={content.story.imageAlt}
              loading="lazy"
              decoding="async"
            />
            <p className="vv-image-note vv-image-note-dark">
              {content.story.sideNote}
            </p>
          </figure>
        </section>

        <section className="vv-prototypes" id="vv-prototypes">
          <div className="vv-section-heading">
            <p className="vv-eyebrow">{content.prototypes.eyebrow}</p>
            <h2>{content.prototypes.title}</h2>
            <p>{content.prototypes.body}</p>
          </div>
          <div className="vv-prototype-grid">
            {content.prototypes.images.map((image) => (
              <figure key={image.src}>
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>{image.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="vv-preorder" id={`vv-${content.preorder.id}`}>
          <img
            className="vv-preorder-background"
            src={content.preorder.backgroundImage}
            alt=""
            loading="lazy"
            aria-hidden="true"
          />
          <div className="vv-preorder-overlay" />
          <div className="vv-preorder-copy">
            <p className="vv-eyebrow">{content.preorder.eyebrow}</p>
            <h2>{content.preorder.title}</h2>
            <p>{content.preorder.body}</p>
            <div className="vv-button-row">
              <button
                className="vv-button vv-button-light"
                type="button"
                onClick={openPreorder}
              >
                {content.preorder.button}
                <ArrowRight aria-hidden="true" />
              </button>
              <button
                className="vv-button vv-button-light-outline"
                type="button"
                onClick={() => scrollToSection('prototypes')}
              >
                {content.preorder.secondaryButton}
              </button>
            </div>
            <p className="vv-preorder-disclaimer">
              {content.preorder.disclaimer}
            </p>
          </div>
        </section>
      </main>

      <footer className="vv-footer">
        <div className="vv-footer-brand">
          {renderLogo('vv-footer-logo')}
          <span>{content.brand.byline}</span>
          <p>{content.footer.tagline}</p>
        </div>
        <nav className="vv-footer-nav" aria-label="Footer navigation">
          {content.navigation.map((item) => (
            <button
              key={item.target}
              type="button"
              onClick={() => scrollToSection(item.target)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="vv-footer-socials">
          {content.footer.socials
            .filter((social) => social.url.trim().length > 0)
            .map((social) => {
              const isExternal = /^https?:\/\//.test(social.url);

              return (
                <a
                  key={social.label}
                  href={social.url}
                  aria-label={social.label}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noreferrer' : undefined}
                >
                  {renderSocialIcon(social.icon)}
                </a>
              );
            })}
        </div>
        <p className="vv-footer-copyright">{content.footer.copyright}</p>
      </footer>

      <dialog
        ref={dialogRef}
        className="vv-dialog"
        aria-labelledby="vv-dialog-title"
        onClick={handleDialogBackdrop}
        onCancel={(event) => {
          event.preventDefault();
          closePreorder();
        }}
      >
        {reservationReference ? (
          <div className="vv-dialog-panel">
            <button
              className="vv-dialog-close"
              type="button"
              aria-label={content.dialog.closeLabel}
              onClick={closePreorder}
            >
              <X aria-hidden="true" />
            </button>

            <div
              className="vv-reservation-success"
              role="status"
              aria-live="polite"
            >
              <span
                className="vv-reservation-success-mark"
                aria-hidden="true"
              >
                <Check />
              </span>
              <p className="vv-eyebrow">{content.dialog.successEyebrow}</p>
              <h2 id="vv-dialog-title">{content.dialog.successTitle}</h2>
              <p className="vv-reservation-success-copy">
                {content.dialog.successBody}
              </p>
              <p className="vv-reservation-reference-label">
                {content.dialog.successReferenceLabel}
              </p>
              <strong className="vv-reservation-reference">
                {reservationReference}
              </strong>
              <button
                className="vv-button vv-button-dark vv-reservation-success-button"
                type="button"
                onClick={closePreorder}
              >
                {content.dialog.successCloseLabel}
              </button>
            </div>
          </div>
        ) : (
          <form className="vv-dialog-panel" onSubmit={handlePreorder}>
            <button
              className="vv-dialog-close"
              type="button"
              aria-label={content.dialog.closeLabel}
              onClick={closePreorder}
            >
              <X aria-hidden="true" />
            </button>

            <div className="vv-dialog-heading">
              <p className="vv-eyebrow">{content.dialog.eyebrow}</p>
              <h2 id="vv-dialog-title">{content.dialog.title}</h2>
              <p>{content.dialog.body}</p>
            </div>

            <div className="vv-form-grid">
              <label>
                <span>{content.dialog.nameLabel}</span>
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>
              <label>
                <span>{content.dialog.emailLabel}</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label>
                <span>{content.dialog.phoneLabel}</span>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </label>
              <label>
                <span>{content.dialog.countryLabel}</span>
                <input
                  type="text"
                  autoComplete="country-name"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                />
              </label>
              <label className="vv-form-version">
                <span>{content.dialog.versionLabel}</span>
                <select
                  value={selectedVersion}
                  onChange={(event) => setSelectedVersion(event.target.value)}
                  required
                >
                  {content.preorder.variants.map((variant) => (
                    <option key={variant.value} value={variant.value}>
                      {variant.label} — €{variant.price.toLocaleString('it-IT', { minimumFractionDigits: Number.isInteger(variant.price) ? 0 : 2 })}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>{content.dialog.quantityLabel}</span>
                <select
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                >
                  {[1, 2, 3, 4, 5].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="vv-form-notes">
                <span>{content.dialog.notesLabel}</span>
                <textarea
                  rows={4}
                  value={notes}
                  placeholder={content.dialog.notesPlaceholder}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </label>
            </div>

            <div className="vv-reservation-summary" aria-live="polite">
              <strong>Estimated total: €{((content.preorder.variants.find(item => item.value === selectedVersion)?.price ?? 0) * 100 * Number(quantity) / 100).toLocaleString('it-IT', { minimumFractionDigits: Number.isInteger((content.preorder.variants.find(item => item.value === selectedVersion)?.price ?? 0) * Number(quantity)) ? 0 : 2, maximumFractionDigits: 2 })}</strong>
              <p>{content.preorder.disclaimer}</p>
            </div>

            <label className="vv-honeypot" aria-hidden="true">
              <span>Website</span>
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </label>

            <label className="vv-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                required
              />
              <span>{content.dialog.consentLabel}</span>
            </label>

            <details className="vv-privacy-details">
              <summary>{content.dialog.privacyLabel}</summary>
              <p>{content.dialog.privacyText}</p>
            </details>

            {formError ? (
              <p className="vv-form-error" role="alert">
                {formError}
              </p>
            ) : null}

            <button
              className="vv-button vv-button-dark vv-dialog-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? content.dialog.submittingLabel
                : content.dialog.submitLabel}
              <ArrowRight aria-hidden="true" />
            </button>

            <p className="vv-dialog-disclaimer">
              {content.preorder.disclaimer}
            </p>
          </form>
        )}
      </dialog>
    </div>
  );
};

export default VagueVasePage;
