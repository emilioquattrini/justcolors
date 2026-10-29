import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import {
  ArrowRight,
  ExternalLink,
  Instagram,
  Mail,
  Menu,
  X,
} from 'lucide-react';
import content from '@/data/vague-vase.json';
import './VagueVasePage.css';

const returnedSetQuantity = () => {
  const params = new URLSearchParams(window.location.search);
  const quantity = params.get('vv_sets');
  if (params.get('vv_cart') !== '1' || !quantity || !/^[1-9]\d{0,2}$/.test(quantity)) {
    return null;
  }
  return quantity;
};

const VagueVasePage = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [returnedQuantity] = useState(returnedSetQuantity);
  const [quantity, setQuantity] = useState(returnedQuantity ?? '1');

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

    const restoreCartOnPageShow = () => {
      const restoredQuantity = returnedSetQuantity();
      if (!restoredQuantity) return;
      setQuantity(restoredQuantity);
      if (dialogRef.current && !dialogRef.current.open) {
        dialogRef.current.showModal();
      }
      document.body.classList.add('vv-dialog-open');
    };
    window.addEventListener('pageshow', restoreCartOnPageShow);

    window.scrollTo({ top: 0, behavior: 'auto' });

    if (returnedQuantity) {
      dialogRef.current?.showModal();
      document.body.classList.add('vv-dialog-open');
    }

    return () => {
      window.removeEventListener('pageshow', restoreCartOnPageShow);
      document.title = previousTitle;
      document.body.classList.remove('vv-dialog-open');

      if (createdDescription) {
        descriptionMeta.remove();
      } else {
        descriptionMeta.content = previousDescription;
      }
    };
  }, [returnedQuantity]);

  const scrollToSection = (target: string) => {
    document
      .getElementById(`vv-${target}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  const openPurchase = () => {
    dialogRef.current?.showModal();
    document.body.classList.add('vv-dialog-open');
  };

  const closePurchase = () => {
    dialogRef.current?.close();
    document.body.classList.remove('vv-dialog-open');
  };

  const handleDialogBackdrop = (event: ReactMouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) closePurchase();
  };

  const checkoutUrl = new URL(
    `/cart/${content.purchase.variantId}:${quantity},${content.purchase.stemVariantId}:${quantity}`,
    content.purchase.shopUrl,
  );
  checkoutUrl.searchParams.set('utm_source', 'vaguevase');
  checkoutUrl.searchParams.set('utm_medium', 'website');

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
            onClick={openPurchase}
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
            openPurchase();
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
                onClick={openPurchase}
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
              onClick={openPurchase}
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
              onClick={openPurchase}
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

        <section className="vv-preorder" id={`vv-${content.purchase.id}`}>
          <img
            className="vv-preorder-background"
            src={content.purchase.backgroundImage}
            alt=""
            loading="lazy"
            aria-hidden="true"
          />
          <div className="vv-preorder-overlay" />
          <div className="vv-preorder-copy">
            <p className="vv-eyebrow">{content.purchase.eyebrow}</p>
            <h2>{content.purchase.title}</h2>
            <p>{content.purchase.body}</p>
            <div className="vv-button-row">
              <button
                className="vv-button vv-button-light"
                type="button"
                onClick={openPurchase}
              >
                {content.purchase.button}
                <ArrowRight aria-hidden="true" />
              </button>
              <button
                className="vv-button vv-button-light-outline"
                type="button"
                onClick={() => scrollToSection('prototypes')}
              >
                {content.purchase.secondaryButton}
              </button>
            </div>
            <p className="vv-preorder-disclaimer">
              {content.purchase.disclaimer}
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
          closePurchase();
        }}
      >
        <div className="vv-dialog-panel">
          <button className="vv-dialog-close" type="button"
            aria-label={content.dialog.closeLabel} onClick={closePurchase}>
            <X aria-hidden="true" />
          </button>
          <div className="vv-dialog-heading">
            <p className="vv-eyebrow">{content.dialog.eyebrow}</p>
            <h2 id="vv-dialog-title">{content.dialog.title}</h2>
            <p>{content.dialog.body}</p>
          </div>
          <img src={content.purchase.image} alt={content.purchase.productTitle}
            style={{ width: '100%', maxHeight: 240, objectFit: 'contain' }} />
          <p>{content.purchase.variantLabel}</p>
          <p>{content.purchase.contentsLabel}</p>
          <div className="vv-form-grid">
            <label>
              <span>{content.dialog.quantityLabel}</span>
              <select value={quantity} onChange={(event) => setQuantity(event.target.value)}>
                {Array.from(new Set([1, 2, 3, 4, 5, Number(quantity)])).sort((a, b) => a - b).map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <p aria-live="polite">
            Total: {new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' })
              .format(content.purchase.price * Number(quantity))}
          </p>
          <p className="vv-dialog-disclaimer">{content.purchase.disclaimer}</p>
          <a className="vv-button vv-button-dark vv-dialog-submit" href={checkoutUrl.href}>
            {content.dialog.submitLabel}
            <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </dialog>
    </div>
  );
};

export default VagueVasePage;
