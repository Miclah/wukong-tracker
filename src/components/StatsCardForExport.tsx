import { forwardRef } from 'react';
import { bosses } from '../data/bosses';
import { ACHIEVEMENTS } from '../data/achievements';
import {
  totalDeaths,
  totalKills,
  hardestBoss,
  cleanestKill,
} from '../lib/stats';
import type { BossProgress } from '../types';

export type ExportVariant = 'suffering' | 'chronicle' | 'triumph';

type Props = {
  progress: Record<string, BossProgress>;
  unlockedAchievements: string[];
  variant?: ExportVariant;
};

// ── Light-theme palette (always used for export) ─────────────────────────────
const C = {
  canvas:        '#f5ead4',
  parchment:     '#d9c89e',
  parchmentAged: '#c4b285',
  stained:       '#ad9c70',
  ink:           '#1f1812',
  inkMute:       '#6b5a44',
  inkFaded:      '#8a7558',
  hairline:      '#4a3a2a',
  primary:       '#c4453a',
  jade:          '#5a8a6e',
  gold:          '#c89b3c',
};

function fmt(ts: number): string {
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

/**
 * Hidden parchment-scroll export card. Mounted off-screen; html-to-image
 * rasterizes it at pixelRatio 2 (effective 2400×3000 output).
 *
 * Deliberately flat DOM structure — no absolute/relative positioning tricks —
 * so html-to-image's foreignObject renderer has no ambiguity.
 */
export const StatsCardForExport = forwardRef<HTMLDivElement, Props>(
  ({ progress, unlockedAchievements, variant = 'chronicle' }, ref) => {
    const deaths  = totalDeaths(progress);
    const kills   = totalKills(progress);
    const hardest  = hardestBoss(progress, bosses);
    const cleanest = cleanestKill(progress, bosses);

    const allAttempts = Object.values(progress).flatMap((p) => p.attempts);
    const timestamps  = allAttempts.map((a) => a.timestamp);
    const startTs  = timestamps.length ? Math.min(...timestamps) : null;
    const endTs    = timestamps.length ? Math.max(...timestamps) : null;
    const dayCount = startTs ? Math.floor((Date.now() - startTs) / 86_400_000) + 1 : 0;

    const startDate = startTs ? fmt(startTs) : '—';
    const endDate   = endTs   ? fmt(endTs)   : 'ongoing';

    const showcaseIds = [...unlockedAchievements].slice(-3).reverse();
    const showcase = showcaseIds
      .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
      .filter(Boolean) as typeof ACHIEVEMENTS;

    const accentColor =
      variant === 'suffering' ? C.primary :
      variant === 'triumph'   ? C.jade    : C.gold;

    return (
      <div
        ref={ref}
        style={{
          width: '1200px',
          backgroundColor: C.parchment,
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '64px',
          boxSizing: 'border-box',
          borderTop: `8px solid ${accentColor}`,
        }}
      >
        {/* ── Header ── */}
        <div style={{ marginBottom: '12px' }}>
          <p style={{
            fontFamily: '"Noto Serif SC", "Microsoft YaHei", "PingFang SC", "SimSun", serif',
            fontSize: '16px',
            color: C.inkMute,
            margin: 0,
            marginBottom: '10px',
            letterSpacing: '3px',
          }}>
            受難山河
          </p>
          <h1 style={{
            fontFamily: 'Cinzel, "Cormorant SC", serif',
            fontSize: '36px',
            fontWeight: 600,
            letterSpacing: '3px',
            color: C.ink,
            margin: 0,
            textTransform: 'uppercase' as const,
          }}>
            The Pilgrimage of Anonymous
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            color: C.inkFaded,
            margin: 0,
            marginTop: '10px',
            letterSpacing: '0.5px',
          }}>
            {startDate !== '—' ? `${startDate} — ${endDate}` : 'No attempts recorded yet'}
          </p>
        </div>

        <Divider />

        {/* ── Stat blocks — layout and sizing vary by variant ── */}
        {variant === 'chronicle' && (
          <div style={{ display: 'flex', gap: '0', marginBottom: '48px' }}>
            <BigStat label="Deaths" value={String(deaths)} color={C.primary} size={88} />
            <StatDivider />
            <BigStat label="Vanquished" value={String(kills)} color={C.jade} size={88} />
            <StatDivider />
            <BigStat label="Days" value={dayCount > 0 ? String(dayCount) : '—'} color={C.inkMute} size={88} />
          </div>
        )}
        {variant === 'suffering' && (
          <div style={{ marginBottom: '48px' }}>
            <BigStat label="Deaths" value={String(deaths)} color={C.primary} size={160} />
            <div style={{
              display: 'flex',
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: `1px solid ${C.hairline}`,
              opacity: 0.7,
            }}>
              <BigStat label="Vanquished" value={String(kills)} color={C.jade} size={56} />
              <StatDivider />
              <BigStat label="Days" value={dayCount > 0 ? String(dayCount) : '—'} color={C.inkMute} size={56} />
            </div>
          </div>
        )}
        {variant === 'triumph' && (
          <div style={{ marginBottom: '48px' }}>
            <BigStat label="Vanquished" value={String(kills)} color={C.jade} size={160} />
            <div style={{
              display: 'flex',
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: `1px solid ${C.hairline}`,
              opacity: 0.7,
            }}>
              <BigStat label="Deaths" value={String(deaths)} color={C.primary} size={56} />
              <StatDivider />
              <BigStat label="Days" value={dayCount > 0 ? String(dayCount) : '—'} color={C.inkMute} size={56} />
            </div>
          </div>
        )}

        <Divider />

        {/* ── Boss highlights ── */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '28px', marginBottom: '48px' }}>
          {hardest ? (
            <BossHighlight
              label="Hardest Foe"
              boss={hardest.boss}
              detail={`${hardest.deaths} death${hardest.deaths !== 1 ? 's' : ''}`}
              accentColor={C.primary}
            />
          ) : (
            <EmptyHighlight label="Hardest Foe" />
          )}
          {cleanest ? (
            <BossHighlight
              label="Cleanest Kill"
              boss={cleanest.boss}
              detail={cleanest.deaths === 0 ? 'first try · 0 deaths' : `${cleanest.deaths} death${cleanest.deaths !== 1 ? 's' : ''}`}
              accentColor={C.jade}
            />
          ) : (
            <EmptyHighlight label="Cleanest Kill" />
          )}
        </div>

        {/* ── Achievement showcase ── */}
        {showcase.length > 0 && (
          <>
            <Divider />
            <div style={{ marginBottom: '48px' }}>
              <SectionLabel>Achievements Unlocked</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px', marginTop: '20px' }}>
                {showcase.map((a) => (
                  <div key={a.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    backgroundColor: C.canvas,
                    border: `1px solid ${C.stained}`,
                    borderRadius: '6px',
                  }}>
                    <span style={{
                      fontFamily: '"Noto Serif SC", "Microsoft YaHei", "PingFang SC", "SimSun", serif',
                      fontSize: '22px',
                      color: C.primary,
                      lineHeight: '1',
                      minWidth: '28px',
                    }}>
                      勝
                    </span>
                    <div>
                      <p style={{
                        fontFamily: 'Cinzel, serif',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: C.ink,
                        margin: 0,
                      }}>
                        {a.name}
                      </p>
                      <p style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        color: C.inkMute,
                        margin: 0,
                        marginTop: '2px',
                      }}>
                        {a.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Divider />

        {/* ── Footer: dates + seal ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
            <DateRow glyph="始" label="Began" value={startDate} />
            <DateRow glyph="終" label="Last entry" value={endDate === startDate ? 'ongoing' : endDate} />
          </div>
          <ExportSeal size={88} />
        </div>

        {/* ── Attribution ── */}
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          color: C.inkFaded,
          letterSpacing: '2px',
          textTransform: 'uppercase' as const,
          textAlign: 'center' as const,
          marginTop: '48px',
          marginBottom: 0,
          opacity: 0.7,
        }}>
          Wukong Suffering Tracker
        </p>
      </div>
    );
  },
);

StatsCardForExport.displayName = 'StatsCardForExport';

// ── Sub-components ────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div style={{
      height: '1px',
      backgroundColor: C.hairline,
      opacity: 0.35,
      marginBottom: '40px',
    }} />
  );
}

function StatDivider() {
  return (
    <div style={{
      width: '1px',
      alignSelf: 'stretch',
      backgroundColor: C.hairline,
      opacity: 0.25,
      margin: '0 8px',
    }} />
  );
}

function BigStat({ label, value, color, size = 88 }: { label: string; value: string; color: string; size?: number }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' as const, padding: '8px 16px' }}>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '2px',
        color: C.inkMute,
        margin: 0,
        marginBottom: '10px',
        textTransform: 'uppercase' as const,
      }}>
        {label}
      </p>
      <span style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: `${size}px`,
        fontWeight: 600,
        color,
        lineHeight: '1',
        display: 'block',
      }}>
        {value}
      </span>
    </div>
  );
}

function BossHighlight({
  label, boss, detail, accentColor,
}: {
  label: string;
  boss: { name: string; nameZh: string; imageUrl: string };
  detail: string;
  accentColor: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <img
        src={boss.imageUrl}
        alt={boss.name}
        width={80}
        height={80}
        style={{
          width: '80px',
          height: '80px',
          objectFit: 'cover' as const,
          borderRadius: '6px',
          border: `1px solid ${C.stained}`,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '2px',
          color: C.inkMute,
          margin: 0,
          marginBottom: '4px',
          textTransform: 'uppercase' as const,
        }}>
          {label}
        </p>
        <p style={{
          fontFamily: 'Cinzel, "Cormorant SC", serif',
          fontSize: '22px',
          fontWeight: 500,
          color: C.ink,
          margin: 0,
        }}>
          {boss.name}
        </p>
        <p style={{
          fontFamily: '"Noto Serif SC", "Microsoft YaHei", "PingFang SC", "SimSun", serif',
          fontSize: '14px',
          color: C.inkMute,
          margin: 0,
          marginTop: '2px',
        }}>
          {boss.nameZh}
        </p>
      </div>
      <span style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '26px',
        fontWeight: 600,
        color: accentColor,
        flexShrink: 0,
      }}>
        {detail}
      </span>
    </div>
  );
}

function EmptyHighlight({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: 0.35 }}>
      <div style={{
        width: '80px',
        height: '80px',
        backgroundColor: C.parchmentAged,
        borderRadius: '6px',
        border: `1px solid ${C.stained}`,
        flexShrink: 0,
      }} />
      <div>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '2px',
          color: C.inkMute,
          margin: 0,
          marginBottom: '4px',
          textTransform: 'uppercase' as const,
        }}>
          {label}
        </p>
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', color: C.inkMute, margin: 0 }}>
          Not yet encountered
        </p>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '2px',
      color: C.inkMute,
      margin: 0,
      textTransform: 'uppercase' as const,
    }}>
      {children}
    </p>
  );
}

function ExportSeal({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', transform: 'rotate(-3deg)', flexShrink: 0 }}
    >
      <rect x="2" y="2" width="56" height="56" rx="1" fill="#c4453a" />
      <rect x="5" y="5" width="50" height="50" rx="0.5" fill="none" stroke="#f5e9d4" strokeWidth="1" opacity="0.5" />
      <g fill="#f5e9d4" opacity="0.92">
        <rect x="9"  y="10" width="10" height="1.5" rx="0.5" />
        <rect x="9"  y="13" width="10" height="1.5" rx="0.5" />
        <rect x="9"  y="16" width="6"  height="1.5" rx="0.5" />
        <rect x="13" y="10" width="1.5" height="9"  rx="0.5" />
        <rect x="33" y="10" width="10" height="1.5" rx="0.5" />
        <rect x="33" y="13" width="10" height="1.5" rx="0.5" />
        <rect x="33" y="16" width="10" height="1.5" rx="0.5" />
        <rect x="37" y="10" width="1.5" height="9"  rx="0.5" />
        <rect x="40" y="13" width="1.5" height="6"  rx="0.5" />
        <rect x="9"  y="33" width="10" height="1.5" rx="0.5" />
        <rect x="9"  y="36" width="10" height="1.5" rx="0.5" />
        <rect x="9"  y="39" width="10" height="1.5" rx="0.5" />
        <rect x="11" y="33" width="1.5" height="9"  rx="0.5" />
        <rect x="16" y="33" width="1.5" height="9"  rx="0.5" />
        <rect x="33" y="34" width="10" height="1.5" rx="0.5" />
        <rect x="36" y="33" width="1.5" height="10" rx="0.5" />
        <rect x="33" y="38" width="4"  height="1.5" rx="0.5" />
        <rect x="40" y="38" width="4"  height="1.5" rx="0.5" transform="rotate(20 40 38)" />
      </g>
      <line x1="30" y1="8"  x2="30" y2="52" stroke="#f5e9d4" strokeWidth="0.5" opacity="0.25" />
      <line x1="8"  y1="30" x2="52" y2="30" stroke="#f5e9d4" strokeWidth="0.5" opacity="0.25" />
      <rect x="2" y="2" width="56" height="56" rx="1" fill="none" stroke="#6b1f1a" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

function DateRow({ glyph, label, value }: { glyph: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
      <span style={{
        fontFamily: '"Noto Serif SC", "Microsoft YaHei", "PingFang SC", "SimSun", serif',
        fontSize: '20px',
        color: C.primary,
        lineHeight: '1',
        minWidth: '24px',
      }}>
        {glyph}
      </span>
      <span style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '1.5px',
        color: C.inkMute,
        textTransform: 'uppercase' as const,
        minWidth: '84px',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'Cinzel, serif',
        fontSize: '14px',
        color: C.ink,
      }}>
        {value}
      </span>
    </div>
  );
}
