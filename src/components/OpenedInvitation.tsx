import React, { useState } from 'react';
import { MapPin, Phone, RotateCcw } from 'lucide-react';
import redRosesCorner from '../assets/images/red_roses_corner_1795204042074.jpg';
import rosePetalsSpray from '../assets/images/rose_petals_spray_1795204041226.jpg';
import { ScratchHeart } from './ScratchHeart';

interface OpenedInvitationProps {
  revealKey: number;
  onDateScratched: () => void;
  onReplay: () => void;
}

export const OpenedInvitation: React.FC<OpenedInvitationProps> = ({
  revealKey,
  onDateScratched,
  onReplay,
}) => {
  const [venueLoaded, setVenueLoaded] = useState(true);

  const whatsappText = encodeURIComponent(
    'Assalamu Alaikum, we have viewed the Ulfat-e-Nikah invitation for Eman Babar & Sheikh Saud Saeed on 23 December 2026 at Lala Zaar Marriage Lawn. Thank you so much for inviting us. Wishing the couple a blessed and joyful union.'
  );
  const whatsappUrl = `https://wa.me/923132042174?text=${whatsappText}`;
  const mapsUrl =
    'https://www.google.com/maps/search/?api=1&query=Lala+Zaar+Marriage+Lawn+Near+Al-syad+Center+Quaid-Abad';

  return (
    <div
      key={revealKey}
      className="relative mx-auto w-full max-w-[580px] px-3 py-3 sm:px-4 sm:py-5"
    >
      {/* Subtle layered stationery backing beneath opened card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-5 top-5 bottom-3 -rotate-[0.8deg] rounded-[28px] border border-[#8AC0E2]/55 bg-[#DAEBF7] shadow-[0_16px_40px_rgba(44,96,136,0.12)] sm:inset-x-6"
      />

      {/* Main Opened Stationery Card */}
      <main className="paper-surface relative overflow-hidden rounded-[26px] border border-[#84BCDF]/80 shadow-[0_24px_65px_-14px_rgba(32,76,112,0.24),0_8px_22px_-8px_rgba(180,68,82,0.12)]">
        {/* Inner Stationery Hairline Frames */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 z-10 rounded-[20px] border border-[#7DB6DA]/50"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[18px] z-10 rounded-[16px] border border-[#D47380]/25"
        />

        {/* Top-left & Top-right Red Roses (seamless edge-free blend) */}
        <img
          src={redRosesCorner}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="pointer-events-none absolute -top-2 -left-2 z-0 h-32 w-32 object-contain opacity-95 brightness-[1.07] contrast-[1.08] mix-blend-multiply sm:h-36 sm:w-36"
          style={{
            maskImage: 'radial-gradient(circle at 12% 12%, black 42%, transparent 74%)',
            WebkitMaskImage: 'radial-gradient(circle at 12% 12%, black 42%, transparent 74%)',
          }}
        />
        <img
          src={redRosesCorner}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="pointer-events-none absolute -top-2 -right-2 z-0 h-32 w-32 scale-x-[-1] object-contain opacity-95 brightness-[1.07] contrast-[1.08] mix-blend-multiply sm:h-36 sm:w-36"
          style={{
            maskImage: 'radial-gradient(circle at 12% 12%, black 42%, transparent 74%)',
            WebkitMaskImage: 'radial-gradient(circle at 12% 12%, black 42%, transparent 74%)',
          }}
        />

        <div className="relative z-20 flex flex-col items-center px-6 pt-10 pb-9 text-center sm:px-10 sm:pt-12 sm:pb-10">
          {/* 1. BISMILLAH SECTION */}
          <section
            aria-label="Bismillah"
            className="animate-[fadeIn_900ms_ease-out_both] relative flex flex-col items-center"
          >
            <div
              aria-hidden="true"
              className="animate-soft-glow pointer-events-none absolute -inset-3 rounded-full bg-gradient-to-r from-[#B8DFF5]/35 via-[#FFFDF8]/70 to-[#F3C5CB]/30 blur-xl"
            />
            <div className="relative overflow-hidden px-2">
              <img
                src="./assets/aistudio/Screenshot_2026-11-21_000241_a4cd0590.png"
                alt="بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ"
                referrerPolicy="no-referrer"
                className="relative mx-auto h-auto max-h-[76px] w-auto max-w-[250px] object-contain object-[60%_50%] brightness-[1.06] contrast-[1.1] mix-blend-multiply sm:max-h-[88px] sm:max-w-[295px]"
                style={{
                  maskImage:
                    'radial-gradient(ellipse 76% 62% at 54% 50%, black 38%, transparent 86%)',
                  WebkitMaskImage:
                    'radial-gradient(ellipse 76% 62% at 54% 50%, black 38%, transparent 86%)',
                }}
              />
            </div>
            <span lang="ar" dir="rtl" className="sr-only">
              بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ
            </span>
          </section>

          {/* Ornamental hairline */}
          <div aria-hidden="true" className="my-4 flex items-center gap-3">
            <span className="h-[1px] w-14 bg-gradient-to-r from-transparent to-[#6AA9D2]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#C94D5C]" />
            <span className="h-[1px] w-14 bg-gradient-to-l from-transparent to-[#6AA9D2]" />
          </div>

          {/* 2. WELCOME SECTION */}
          <section aria-label="Welcome" className="max-w-md">
            <p className="font-editorial text-balance text-[17px] italic leading-relaxed text-[#385873] sm:text-[19px]">
              With the blessings of Almighty Allah and the love of our families, we joyfully invite
              you to grace the sacred Nikah ceremony of
            </p>
          </section>

          {/* 3. COUPLE NAMES */}
          <section aria-label="Couple" className="mt-5 w-full">
            <h1 className="font-editorial text-balance text-4xl font-semibold tracking-wide text-[#17324A] sm:text-[44px]">
              Eman Babar
            </h1>
            <div className="my-1.5 flex items-center justify-center gap-3">
              <span className="h-[1px] w-8 bg-[#8DC0E0]" />
              <span className="font-editorial text-2xl italic text-[#C54B5A] sm:text-3xl">&amp;</span>
              <span className="h-[1px] w-8 bg-[#8DC0E0]" />
            </div>
            <h2 className="font-editorial text-balance text-4xl font-semibold tracking-wide text-[#17324A] sm:text-[44px]">
              Sheikh Saud Saeed
            </h2>
          </section>

          {/* 4. SCRATCH ME HEART (ONLY DATE SOURCE) */}
          <section aria-label="Scratch Me" className="mt-6 w-full">
            <p className="text-xs font-semibold tracking-[0.24em] text-[#4C7FA6] uppercase">
              SCRATCH ME
            </p>

            <div className="mt-3">
              <ScratchHeart onRevealed={onDateScratched} resetSignal={revealKey} />
            </div>
          </section>

          {/* Subtle Divider */}
          <div
            aria-hidden="true"
            className="my-5 h-[1px] w-full max-w-xs bg-gradient-to-r from-transparent via-[#89BEE0]/75 to-transparent"
          />

          {/* 5. EVENT INFORMATION (ONLY NIKAH & DINNER) */}
          <section aria-label="Event Schedule" className="w-full max-w-sm">
            <div className="grid grid-cols-2 divide-x divide-[#96C6E4]/65 rounded-2xl border border-[#96C6E4]/60 bg-gradient-to-br from-[#F1F8FD]/90 via-[#FCF9F4] to-[#FDF1F2]/75 py-3.5 shadow-[0_6px_18px_rgba(62,124,170,0.08)]">
              <div className="px-3">
                <p className="text-xs font-semibold tracking-[0.2em] text-[#427AA3] uppercase">
                  Nikah
                </p>
                <p className="font-editorial mt-1 text-2xl font-semibold text-[#183148] tabular-nums sm:text-[26px]">
                  8:00 PM
                </p>
              </div>
              <div className="px-3">
                <p className="text-xs font-semibold tracking-[0.2em] text-[#B84554] uppercase">
                  Dinner
                </p>
                <p className="font-editorial mt-1 text-2xl font-semibold text-[#183148] tabular-nums sm:text-[26px]">
                  8:30 PM
                </p>
              </div>
            </div>
          </section>

          {/* 6. REAL LALAZAR VENUE PHOTO & GOOGLE MAPS */}
          <section aria-label="Venue" className="mt-6 w-full max-w-md">
            <div className="overflow-hidden rounded-[20px] border border-[#88BFE1]/70 bg-white/85 p-2 shadow-[0_14px_34px_-10px_rgba(45,98,138,0.2)]">
              <div className="relative overflow-hidden rounded-[14px] bg-[#E8F2F9]">
                {venueLoaded ? (
                  <img
                    src="./assets/aistudio/Lalazar_hall_8c185dea.webp"
                    alt="Lala Zaar Marriage Lawn venue exterior"
                    referrerPolicy="no-referrer"
                    onError={() => setVenueLoaded(false)}
                    className="h-44 w-full object-cover object-center sm:h-52"
                  />
                ) : (
                  <div className="flex h-44 w-full flex-col items-center justify-center bg-gradient-to-br from-[#DCEEF9] to-[#F8EAEB] text-[#356286]">
                    <MapPin className="h-8 w-8 text-[#4688B8]" />
                    <span className="font-editorial mt-2 text-lg font-semibold">
                      LALA ZAAR MARRIAGE LAWN
                    </span>
                  </div>
                )}
              </div>

              <div className="px-2 pt-3.5 pb-2.5">
                <h3 className="font-editorial text-[17px] font-semibold tracking-[0.04em] text-[#17324A] sm:text-2xl sm:tracking-[0.06em]">
                  LALA ZAAR MARRIAGE LAWN
                </h3>
                <p className="mt-0.5 text-sm text-[#4D6C86]">
                  Near Al-syad Center, Quaid-Abad
                </p>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3.5 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-[#E597A1]/60 bg-gradient-to-r from-[#4B93C5] to-[#3B7FAE] px-6 py-2.5 text-xs font-semibold tracking-[0.14em] text-white shadow-[0_8px_20px_-6px_rgba(56,125,176,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-6px_rgba(56,125,176,0.6)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3B7FAE]"
                >
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">OPEN IN GOOGLE MAPS</span>
                </a>
              </div>
            </div>
          </section>

          {/* 7. FAMILY & CONTACT SECTION (NO RSVP) */}
          <section aria-label="Family Contact" className="mt-6 w-full max-w-md">
            <div className="border-t border-b border-[#92C2E1]/55 py-5">
              <p className="text-xs font-medium tracking-[0.18em] text-[#4E7B9E] uppercase">
                With Warm Regards
              </p>
              <p className="font-editorial mt-1 text-2xl font-semibold text-[#183148] sm:text-[26px]">
                Mr. &amp; Mrs. Babar Aziz
              </p>
              <p className="mt-1 text-sm font-medium tracking-wider text-[#B64452] tabular-nums">
                0313-2042174
              </p>

              <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-full border border-[#5B9EC9]/45 bg-[#258958] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_-6px_rgba(37,137,88,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1F754B] sm:w-auto"
                >
                  {/* Official WhatsApp glyph */}
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0 fill-current"
                    aria-hidden="true"
                  >
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.79 14.11c-.24.68-1.41 1.3-1.95 1.38-.5.08-1.13.11-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3s.75-2.12 1.01-2.41c.27-.29.58-.36.77-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2.01.89 2.16.07.15.12.32.02.51-.1.19-.14.32-.29.49-.15.17-.31.38-.44.51-.14.15-.3.31-.13.6.17.29.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.44.29.15.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.39-.24.65-.14.27.1 1.69.8 1.98.94.29.15.48.22.55.34.07.12.07.7-.17 1.38z" />
                  </svg>
                  <span className="whitespace-nowrap">Message Now</span>
                </a>

                <a
                  href="tel:03132042174"
                  className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full border border-[#6BA8D1] bg-[#EBF5FC] px-6 py-2.5 text-sm font-semibold text-[#1B4263] shadow-[0_6px_14px_-6px_rgba(62,124,170,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#DCEEFB] sm:w-auto"
                >
                  <Phone className="h-4 w-4 shrink-0 text-[#3B82B8]" />
                  <span className="whitespace-nowrap">Call Now</span>
                </a>
              </div>
            </div>
          </section>

          {/* 8. THANK YOU & REPLAY INVITATION */}
          <section aria-label="Closing" className="mt-5 flex flex-col items-center">
            <img
              src={rosePetalsSpray}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="pointer-events-none h-20 w-auto object-contain opacity-95 brightness-[1.08] contrast-[1.08] mix-blend-multiply"
              style={{
                maskImage: 'radial-gradient(ellipse 62% 62% at 50% 50%, black 32%, transparent 78%)',
                WebkitMaskImage:
                  'radial-gradient(ellipse 62% 62% at 50% 50%, black 32%, transparent 78%)',
              }}
            />
            <h3 className="font-editorial text-2xl font-semibold italic text-[#234866]">
              Thank You
            </h3>
            <p className="mt-1 max-w-xs text-balance text-xs leading-relaxed text-[#57758E]">
              Your presence and heartfelt prayers will make this blessed evening truly unforgettable.
            </p>

            <button
              type="button"
              onClick={onReplay}
              className="mt-5 inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-full border border-[#D47380]/55 bg-white/85 px-6 py-2.5 text-xs font-semibold tracking-[0.14em] text-[#9E3543] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FDF1F2] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C54B5A]"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">REPLAY INVITATION</span>
            </button>
          </section>
        </div>

        {/* Bottom corner realistic red roses (seamless edge-free blend) */}
        <img
          src={redRosesCorner}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="pointer-events-none absolute -bottom-3 -left-3 z-0 h-28 w-28 -rotate-90 object-contain opacity-95 brightness-[1.07] contrast-[1.08] mix-blend-multiply sm:h-32 sm:w-32"
          style={{
            maskImage: 'radial-gradient(circle at 12% 12%, black 42%, transparent 74%)',
            WebkitMaskImage: 'radial-gradient(circle at 12% 12%, black 42%, transparent 74%)',
          }}
        />
        <img
          src={redRosesCorner}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="pointer-events-none absolute -right-3 -bottom-3 z-0 h-28 w-28 rotate-180 object-contain opacity-95 brightness-[1.07] contrast-[1.08] mix-blend-multiply sm:h-32 sm:w-32"
          style={{
            maskImage: 'radial-gradient(circle at 12% 12%, black 42%, transparent 74%)',
            WebkitMaskImage: 'radial-gradient(circle at 12% 12%, black 42%, transparent 74%)',
          }}
        />
      </main>
    </div>
  );
};
