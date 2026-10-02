'use client';

import Link from 'next/link';

import {
  useEffect,
  useState,
} from 'react';

const COOKIE_NAME =
  'biosfera_cookie_consent';

const COOKIE_MAX_AGE =
  60 * 60 * 24 * 365;

type ConsentState = {
  analytics: boolean;
  advertising: boolean;
};

const defaultConsent: ConsentState = {
  analytics: false,
  advertising: false,
};

function readConsent():
  | ConsentState
  | null {
  if (
    typeof document ===
    'undefined'
  ) {
    return null;
  }

  const entry =
    document.cookie
      .split('; ')
      .find(item =>
        item.startsWith(
          `${COOKIE_NAME}=`,
        ),
      );

  if (!entry) {
    return null;
  }

  try {
    const raw =
      decodeURIComponent(
        entry.substring(
          COOKIE_NAME.length +
            1,
        ),
      );

    const parsed =
      JSON.parse(raw);

    return {
      analytics:
        parsed.analytics ===
        true,
      advertising:
        parsed.advertising ===
        true,
    };
  } catch {
    return null;
  }
}

function saveConsent(
  consent: ConsentState,
) {
  const value =
    encodeURIComponent(
      JSON.stringify(
        consent,
      ),
    );

  document.cookie =
    `${COOKIE_NAME}=${value}; ` +
    `Max-Age=${COOKIE_MAX_AGE}; ` +
    `Path=/; ` +
    `SameSite=Lax`;

  window.dispatchEvent(
    new CustomEvent(
      'biosfera:cookie-consent-changed',
      {
        detail: consent,
      },
    ),
  );
}

export function CookieConsent() {
  const [
    visible,
    setVisible,
  ] = useState(false);

  const [
    customizing,
    setCustomizing,
  ] = useState(false);

  const [
    consent,
    setConsent,
  ] =
    useState<ConsentState>(
      defaultConsent,
    );

  useEffect(() => {
    const existing =
      readConsent();

    if (!existing) {
      setVisible(true);
    } else {
      setConsent(existing);
    }

    function openPreferences() {
      const current =
        readConsent();

      setConsent(
        current ??
          defaultConsent,
      );

      setCustomizing(true);
      setVisible(true);
    }

    window.addEventListener(
      'biosfera:open-cookie-preferences',
      openPreferences,
    );

    return () => {
      window.removeEventListener(
        'biosfera:open-cookie-preferences',
        openPreferences,
      );
    };
  }, []);

  function acceptAll() {
    const next = {
      analytics: true,
      advertising: true,
    };

    saveConsent(next);
    setConsent(next);
    setVisible(false);
    setCustomizing(false);
  }

  function rejectOptional() {
    const next = {
      analytics: false,
      advertising: false,
    };

    saveConsent(next);
    setConsent(next);
    setVisible(false);
    setCustomizing(false);
  }

  function savePreferences() {
    saveConsent(consent);
    setVisible(false);
    setCustomizing(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      className="cookie-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-title"
    >
      <div className="cookie-box">
        <div className="cookie-copy">
          <p className="cookie-eyebrow">
            PRIVACIDADE
          </p>

          <h2 id="cookie-title">
            Suas escolhas de cookies
          </h2>

          <p>
            A Biosfera utiliza cookies
            necessários para o
            funcionamento do portal.
            Você também pode escolher
            se deseja permitir cookies
            de análise e publicidade.
          </p>

          <p>
            Sua escolha poderá ser
            alterada posteriormente
            pelo link de preferências
            disponível no rodapé.
          </p>

          <div className="cookie-links">
            <Link href="/politica-de-cookies">
              Política de Cookies
            </Link>

            <Link href="/politica-de-privacidade">
              Política de Privacidade
            </Link>
          </div>
        </div>

        {customizing ? (
          <div className="cookie-options">
            <div className="cookie-option">
              <div>
                <strong>
                  Cookies necessários
                </strong>

                <p>
                  Utilizados para
                  navegação,
                  funcionamento,
                  segurança e registro
                  das suas escolhas.
                </p>
              </div>

              <span className="always-on">
                Sempre ativos
              </span>
            </div>

            <label className="cookie-option">
              <div>
                <strong>
                  Análise e desempenho
                </strong>

                <p>
                  Permitem compreender
                  como o portal é
                  utilizado e melhorar
                  sua experiência.
                </p>
              </div>

              <input
                type="checkbox"
                checked={
                  consent.analytics
                }
                onChange={event =>
                  setConsent(
                    current => ({
                      ...current,
                      analytics:
                        event.target
                          .checked,
                    }),
                  )
                }
              />
            </label>

            <label className="cookie-option">
              <div>
                <strong>
                  Publicidade
                </strong>

                <p>
                  Relacionados a
                  recursos e serviços
                  de publicidade
                  utilizados pelo
                  portal.
                </p>
              </div>

              <input
                type="checkbox"
                checked={
                  consent.advertising
                }
                onChange={event =>
                  setConsent(
                    current => ({
                      ...current,
                      advertising:
                        event.target
                          .checked,
                    }),
                  )
                }
              />
            </label>
          </div>
        ) : null}

        <div className="cookie-actions">
          {!customizing ? (
            <>
              <button
                type="button"
                className="cookie-button secondary"
                onClick={
                  rejectOptional
                }
              >
                Recusar opcionais
              </button>

              <button
                type="button"
                className="cookie-button secondary"
                onClick={() =>
                  setCustomizing(
                    true,
                  )
                }
              >
                Personalizar
              </button>

              <button
                type="button"
                className="cookie-button primary"
                onClick={
                  acceptAll
                }
              >
                Aceitar todos
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="cookie-button secondary"
                onClick={
                  rejectOptional
                }
              >
                Recusar opcionais
              </button>

              <button
                type="button"
                className="cookie-button primary"
                onClick={
                  savePreferences
                }
              >
                Salvar preferências
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .cookie-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 20px;
          background:
            rgba(
              1,
              14,
              32,
              0.55
            );
          backdrop-filter:
            blur(3px);
        }

        .cookie-box {
          width: min(
            920px,
            100%
          );
          padding: 26px;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.14
            );
          border-radius: 18px;
          background: #06244b;
          color: #ffffff;
          box-shadow:
            0 20px 70px
            rgba(
              0,
              0,
              0,
              0.35
            );
        }

        .cookie-copy {
          max-width: 760px;
        }

        .cookie-eyebrow {
          margin: 0 0 8px;
          color: #38d4f5;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        h2 {
          margin: 0 0 10px;
          color: #ffffff;
          font-size:
            clamp(
              22px,
              3vw,
              30px
            );
        }

        p {
          margin: 0 0 10px;
          color:
            rgba(
              255,
              255,
              255,
              0.82
            );
          line-height: 1.6;
        }

        .cookie-links {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 12px;
        }

        .cookie-links
          :global(a) {
          color: #46d8f6;
          font-size: 13px;
          font-weight: 700;
          text-decoration:
            underline;
          text-underline-offset:
            3px;
        }

        .cookie-options {
          display: grid;
          gap: 10px;
          margin-top: 22px;
        }

        .cookie-option {
          display: flex;
          align-items: center;
          justify-content:
            space-between;
          gap: 22px;
          padding: 14px 16px;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.12
            );
          border-radius: 12px;
          background:
            rgba(
              255,
              255,
              255,
              0.05
            );
        }

        .cookie-option p {
          margin: 4px 0 0;
          font-size: 13px;
        }

        .cookie-option input {
          width: 22px;
          height: 22px;
          flex: 0 0 auto;
          accent-color:
            #38d4f5;
        }

        .always-on {
          flex: 0 0 auto;
          color: #38d4f5;
          font-size: 12px;
          font-weight: 800;
        }

        .cookie-actions {
          display: flex;
          justify-content:
            flex-end;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
        }

        .cookie-button {
          min-height: 44px;
          padding: 10px 17px;
          border-radius: 9px;
          font: inherit;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .cookie-button.primary {
          border: 1px solid
            #38d4f5;
          background: #38d4f5;
          color: #06244b;
        }

        .cookie-button.secondary {
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.22
            );
          background:
            rgba(
              255,
              255,
              255,
              0.06
            );
          color: #ffffff;
        }

        @media (
          max-width: 640px
        ) {
          .cookie-overlay {
            padding: 10px;
          }

          .cookie-box {
            padding: 20px;
            border-radius: 15px;
          }

          .cookie-option {
            align-items:
              flex-start;
          }

          .cookie-actions {
            display: grid;
          }

          .cookie-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export function CookiePreferencesButton() {
  function openPreferences() {
    window.dispatchEvent(
      new Event(
        'biosfera:open-cookie-preferences',
      ),
    );
  }

  return (
    <button
      type="button"
      onClick={
        openPreferences
      }
      style={{
        padding: 0,
        border: 0,
        background:
          'transparent',
        color: 'inherit',
        font: 'inherit',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      Preferências de cookies
    </button>
  );
}