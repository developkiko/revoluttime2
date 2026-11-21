"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — ReviewsSection (infinite scroll + загрузка с API)
// ══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import { useAuth } from "@/lib/ultra/auth-store";
import { DEFAULT_REVIEWS } from "@/lib/ultra/products";
import { Link } from "@/i18n/navigation";
import { UserPlus, ChevronDown, LayoutDashboard } from "lucide-react";


interface ReviewItem {
  name: string;
  role: string;
  text: string;
  stars: number;
  initials: string;
  avatar?: string;
}

export function ReviewsSection() {
  const { lang, t } = useI18n();
  const { isLoggedIn } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch('/api/reviews');
        const data = await res.json();
        
        if (data.reviews && Array.isArray(data.reviews) && data.reviews.length > 0) {
          const mapped = data.reviews.map((r: any) => {
            const name = r['name_' + lang] || r.name_en || '';
            const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase();
            // Если avatar пустая — показываем заглушку av0
            const avatar = (r.avatar && r.avatar !== '' && !r.avatar.startsWith('data:')) ? r.avatar : '/imgs/avas/ava0.jpg';
            return {
              name,
              role: r['role_' + lang] || r.role_en || '',
              text: r['text_' + lang] || r.text_en || '',
              stars: Math.min(5, Math.max(0, r.stars || 0)),
              initials,
              avatar,
            };
          });
          setReviews(mapped);
        } else {
          fallbackToDefaults();
        }
      } catch {
        fallbackToDefaults();
      }
      setLoading(false);
    }

    function fallbackToDefaults() {
      const mapped = DEFAULT_REVIEWS.map(r => ({
        name: r.name[lang],
        role: r.role[lang],
        text: r.text[lang],
        stars: r.stars,
        initials: r.name[lang].split(" ").map((w: string) => w[0]).join("").toUpperCase(),
        avatar: r.avatar || '/imgs/avas/ava0.jpg',
      }));
      setReviews(mapped);
    }

    loadReviews();
  }, [lang]);

  if (loading) {
    return <section className="py-20 bg-[var(--hover-bg)]"><div className="max-w-[var(--max-width)] mx-auto px-6"><p style={{textAlign:'center',color:'#888'}}>Загрузка отзывов...</p></div></section>;
  }

  const items: ReviewItem[] = reviews.length ? reviews : (() => {
    // Показываем пустой список если нет данных
    return [];
  })();

  // Double for seamless loop — 2 full copies
  const doubled = [...items, ...items];

  return (
    <section id="reviews" className="py-20 bg-[var(--hover-bg)] overflow-hidden">
      <div className="max-w-[var(--max-width)] mx-auto px-6">
        <h2 className="text-[1.5rem] sm:text-[2rem] font-bold text-[var(--text-heading)] text-center mb-3">
          {t("reviews_title")}
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] text-center max-w-[600px] mx-auto mb-12">
          {t("reviews_desc")}
        </p>
      </div>

      <div className="reviews-track">
        <div className="reviews-slide">
          {doubled.map((r, i) => (
            <div key={i} className="review-card">
              <div className="review-stars">
                {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
              </div>
              <p className="review-text">{r.text}</p>
              <div className="review-author">
                {r.avatar && r.avatar.startsWith('data:') ? (
                  // Base64 avatar from admin upload
                  <img src={r.avatar} alt={r.name} className="review-avatar-img" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : r.avatar && r.avatar !== '/imgs/avas/ava0.jpg' ? (
                  <img src={r.avatar} alt={r.name} className="review-avatar-img" />
                ) : (
                  <div className="review-avatar">{r.initials}</div>
                )}
                <div>
                  <div className="review-name">{r.name}</div>
                  <div className="review-role">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
          {/* Add more copies for seamless infinite feel */}
          {doubled.map((r, i) => (
            <div key={`dup-${i}`} className="review-card">
              <div className="review-stars">
                {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
              </div>
              <p className="review-text">{r.text}</p>
              <div className="review-author">
                {r.avatar && r.avatar.startsWith('data:') ? (
                  // Base64 avatar from admin upload
                  <img src={r.avatar} alt={r.name} className="review-avatar-img" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : r.avatar && r.avatar !== '/imgs/avas/ava0.jpg' ? (
                  <img src={r.avatar} alt={r.name} className="review-avatar-img" />
                ) : (
                  <div className="review-avatar">{r.initials}</div>
                )}
                <div>
                  <div className="review-name">{r.name}</div>
                  <div className="review-role">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[var(--max-width)] mx-auto px-6 mt-10 text-center">
        <div className="flex flex-wrap justify-center gap-3">
          {["⭐ Trustpilot 4.8", "⭐ G2 4.7", "⭐ Capterra 4.6"].map((p) => (
            <span key={p} className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg px-5 py-2.5 text-sm text-[var(--text-primary)] transition-all hover:border-[var(--color-primary)]/30 hover:text-[var(--text-heading)]">
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Кнопки действий — под отзывами */}
      <div className="max-w-[var(--max-width)] mx-auto px-6 mt-8 text-center">
        <div className="flex flex-wrap justify-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 justify-center py-[0.85rem] px-8 text-base font-semibold rounded-[10px] transition-all bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] whitespace-nowrap"
            >
              <LayoutDashboard className="w-4 h-4" />
              {t("btn_dashboard")}
            </Link>
          ) : (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-auth"))}
              className="inline-flex items-center gap-2 justify-center py-[0.85rem] px-8 text-base font-semibold rounded-[10px] transition-all bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              {t("btn_create_account")}
            </button>
          )}
          <button
            onClick={() => document.getElementById("contacts")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 justify-center py-[0.85rem] px-8 text-base font-semibold rounded-[10px] transition-all border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/12 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 whitespace-nowrap"
          >
            {t("scroll_to_contacts")}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .reviews-track {
          width: 100%;
          overflow: hidden;
          mask: linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%);
        }
        .reviews-slide {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          animation: marquee 60s linear infinite;
        }
        .reviews-track:hover .reviews-slide {
          animation-play-state: paused;
        }
        .review-card {
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          width: 320px;
          flex-shrink: 0;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .review-card:hover {
          border-color: rgba(99, 102, 241, 0.3);
          transform: translateY(-2px);
        }
        .review-stars { font-size: 0.875rem; color: var(--color-warning); margin-bottom: 0.75rem; }
        .review-text { font-size: 0.875rem; color: #bbb; margin-bottom: 1rem; line-height: 1.6; }
        .review-author { display: flex; align-items: center; gap: 0.75rem; }
        .review-avatar {
          width: 2.25rem; height: 2.25rem; border-radius: 50%;
          background: var(--color-primary); color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
        }
        .review-avatar-img { width: 2.25rem; height: 2.25rem; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
        .review-name { font-size: 0.875rem; color: white; font-weight: 600; }
        .review-role { font-size: 0.75rem; color: #777; }

        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .review-card, .review-card img { -webkit-user-drag: none; user-select: none; }

        @media (max-width: 640px) {
          .review-card { width: 85vw; max-width: 340px; }
          .review-slide { animation-duration: 35s; }
        }
      `}</style>
    </section>
  );
}
