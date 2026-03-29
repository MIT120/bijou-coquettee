"use client"

const DEFAULT_MESSAGES = [
  "Безплатна доставка за поръчки над 80лв",
  "Ръчно изработени бижута с любов",
  "14 дни право на връщане",
  "Сертифицирано сребро 925",
  "-20% с код BIJOU20",
]

const AnnouncementMarquee = ({ messages }: { messages?: string[] }) => {
  const displayMessages = messages && messages.length > 0 ? messages : DEFAULT_MESSAGES
  const separator = " ✦ "
  const messageText = displayMessages.join(separator) + separator

  return (
    <div className="bg-grey-90 overflow-hidden relative" aria-label="Announcements">
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="font-sans text-[0.65rem] tracking-[0.14em] uppercase text-cream-100/90 py-1.5 inline-block">
          {messageText}
        </span>
        <span className="font-sans text-[0.65rem] tracking-[0.14em] uppercase text-cream-100/90 py-1.5 inline-block">
          {messageText}
        </span>
        <span className="font-sans text-[0.65rem] tracking-[0.14em] uppercase text-cream-100/90 py-1.5 inline-block">
          {messageText}
        </span>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

export default AnnouncementMarquee
