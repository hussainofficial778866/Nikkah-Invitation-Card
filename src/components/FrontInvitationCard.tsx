import React from 'react';
import handsArtwork from '../assets/images/hands_hold_artwork_1795204040932.jpg';
import redRosesCorner from '../assets/images/red_roses_corner_1795204042074.jpg';

interface FrontInvitationCardProps {
  isOpening: boolean;
  onOpen: () => void;
}

export const FrontInvitationCard: React.FC<FrontInvitationCardProps> = ({ isOpening, onOpen }) => {
  return (
    <div className="card-perspective relative mx-auto w-full max-w-[440px] px-3 py-4 sm:px-0">
      {/* Layered physical paper cards peeking behind main invitation */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-5 top-5 bottom-3 -rotate-[2.2deg] rounded-[26px] border border-[#8BC2E3]/60 bg-[#D7ECF8] shadow-[0_14px_34px_rgba(44,96,136,0.14)] transition-transform duration-700"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-4 bottom-3 rotate-[1.6deg] rounded-[26px] border border-[#E5B8BF]/70 bg-[#F9ECEE] shadow-[0_12px_28px_rgba(140,68,78,0.1)] transition-transform duration-700"
      />

      {/* Inside soft glow peeking underneath when cover swings open */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-3 rounded-[24px] border border-[#96C7E5]/70 bg-gradient-to-b from-[#FDFBF7] via-[#F2F8FC] to-[#FAF3F4] shadow-inner transition-opacity duration-700 ${
          isOpening ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="h-32 w-32 rounded-full bg-[#A5D5F2]/35 blur-2xl" />
          <p className="font-editorial mt-4 text-xl italic text-[#38698F]">
            Opening your invitation...
          </p>
        </div>
      </div>

      {/* Main Front Physical Invitation Card (hinged from left edge on open) */}
      <article
        className={`card-hinge-cover paper-surface relative overflow-hidden rounded-[24px] border border-[#88BFE1]/80 shadow-[0_24px_60px_-12px_rgba(32,76,112,0.28),0_8px_20px_-6px_rgba(170,72,84,0.14)] transition-all duration-[1050ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpening ? '-translate-x-4 opacity-10' : 'opacity-100'
        }`}
        style={{
          transform: isOpening
            ? 'perspective(1800px) rotateY(-108deg) scale(0.97)'
            : 'perspective(1800px) rotateY(0deg) scale(1)',
        }}
      >
        {/* Subtle inner decorative stationery border */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 z-20 rounded-[18px] border border-[#7EB6DA]/55"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[17px] z-20 rounded-[14px] border border-[#D87C88]/30"
        />

        {/* Upper Area: Bride & Groom Hands Holding Each Other + Top Roses */}
        <div className="relative pt-2">
          {/* Soft white ethereal glow behind hands */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-10 top-10 bottom-6 z-10 rounded-full bg-white/30 blur-2xl"
          />
          <div className="relative overflow-hidden rounded-t-[22px]">
            <img
              src={handsArtwork}
              alt="Young bride and groom holding hands surrounded by red roses on sky-blue and ivory paper"
              referrerPolicy="no-referrer"
              className="block h-[230px] w-full object-cover object-center sm:h-[265px]"
            />
            {/* Smooth gradient blend into the lower ivory stationery surface */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#FCF9F4] via-[#FCF9F4]/85 to-transparent"
            />
            {/* Top subtle sky-blue tint vignette */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#DCEEF9]/45 to-transparent"
            />
          </div>
        </div>

        {/* Lower Card Body: Title, Subtitle, Open Invitation CTA */}
        <div className="relative z-20 flex flex-col items-center px-7 pt-1 pb-11 text-center sm:px-9 sm:pb-12">
          {/* Sky-blue & light-red ornamental divider */}
          <div aria-hidden="true" className="mb-3 flex items-center gap-2.5">
            <span className="h-[1px] w-10 bg-gradient-to-r from-transparent to-[#5B9EC9]" />
            <span className="h-2 w-2 rotate-45 border border-[#C95160] bg-[#F7DFE2]" />
            <span className="h-[1px] w-10 bg-gradient-to-l from-transparent to-[#5B9EC9]" />
          </div>

          <p className="font-editorial text-base italic tracking-[0.14em] text-[#4579A1] sm:text-lg">
            Nikah Invitation
          </p>

          <h1 className="font-editorial mt-2 text-4xl font-semibold tracking-[0.06em] text-[#183148] sm:text-[42px]">
            ULFAT-E-NIKAH
          </h1>

          <p className="mt-2.5 max-w-[290px] text-balance text-xs leading-relaxed text-[#526D84]">
            A sacred bond of love, devotion, and lifelong grace
          </p>

          {/* OPEN INVITATION Button physically on the card */}
          <button
            type="button"
            onClick={onOpen}
            disabled={isOpening}
            className="group relative mt-7 inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-full border border-[#E597A1]/70 bg-gradient-to-r from-[#4E96C7] via-[#3E84B6] to-[#4E96C7] px-8 py-3 text-sm font-semibold tracking-[0.14em] text-white shadow-[0_10px_24px_-6px_rgba(56,125,176,0.55),0_0_18px_rgba(125,187,227,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-6px_rgba(56,125,176,0.65)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3E84B6]"
          >
            <span className="relative z-10 whitespace-nowrap">OPEN INVITATION</span>
          </button>
        </div>

        {/* Bottom-left and Bottom-right realistic red roses composited seamlessly */}
        <img
          src={redRosesCorner}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="pointer-events-none absolute -bottom-3 -left-3 z-10 h-32 w-32 -rotate-90 object-contain opacity-95 brightness-[1.07] contrast-[1.08] mix-blend-multiply sm:h-36 sm:w-36"
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
          className="pointer-events-none absolute -right-3 -bottom-3 z-10 h-32 w-32 rotate-180 object-contain opacity-95 brightness-[1.07] contrast-[1.08] mix-blend-multiply sm:h-36 sm:w-36"
          style={{
            maskImage: 'radial-gradient(circle at 12% 12%, black 42%, transparent 74%)',
            WebkitMaskImage: 'radial-gradient(circle at 12% 12%, black 42%, transparent 74%)',
          }}
        />
      </article>
    </div>
  );
};
