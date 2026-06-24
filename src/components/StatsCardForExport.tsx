import { forwardRef } from 'react';
import { bosses } from '../data/bosses';
import { SealStamp } from './SealStamp';
import {
  totalDeaths,
  totalKills,
  hardestBoss,
  cleanestKill,
  highestRageEver,
  longestCleanStreak,
} from '../lib/stats';
import type { BossProgress } from '../types';

type Props = {
  progress: Record<string, BossProgress>;
};

/**
 * Hidden parchment-scroll card that html-to-image rasterizes into a PNG.
 * Must be mounted in the DOM (visibility:hidden) before capture.
 */
export const StatsCardForExport = forwardRef<HTMLDivElement, Props>(
  ({ progress }, ref) => {
    const deaths = totalDeaths(progress);
    const kills = totalKills(progress);
    const hardest = hardestBoss(progress, bosses);
    const cleanest = cleanestKill(progress, bosses);
    const rageResult = highestRageEver(progress, bosses);
    const cleanStreak = longestCleanStreak(progress, bosses);
    const date = new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
      <div
        ref={ref}
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '600px',
          backgroundColor: '#d9c89e',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '48px',
          borderRadius: '12px',
          border: '1px solid #4a3a2a',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <p style={{ fontFamily: '"Noto Serif SC", serif', fontSize: '14px', color: '#6b5a44', margin: 0 }}>
              受難
            </p>
            <h1 style={{
              fontFamily: 'Cinzel, "Cormorant SC", serif',
              fontSize: '28px',
              fontWeight: 500,
              letterSpacing: '0.3px',
              color: '#1f1812',
              margin: 0,
              marginTop: '2px',
            }}>
              The Suffering
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#8a7558', margin: 0, marginTop: '4px' }}>
              {date}
            </p>
          </div>
          <SealStamp size={72} />
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#4a3a2a', opacity: 0.4, marginBottom: '28px' }} />

        {/* Core stats row */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '28px' }}>
          <StatBlock label="Total Deaths" value={deaths} />
          <StatBlock label="Bosses Vanquished" value={`${kills} / ${bosses.length}`} />
          {rageResult && <StatBlock label="Peak Rage" value={rageResult.rage} />}
          {cleanStreak > 0 && <StatBlock label="Clean Streak" value={cleanStreak} />}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#4a3a2a', opacity: 0.4, marginBottom: '28px' }} />

        {/* Boss highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {hardest && (
            <HighlightRow
              label="Hardest Boss"
              name={hardest.boss.name}
              detail={`${hardest.deaths} death${hardest.deaths !== 1 ? 's' : ''}`}
              accent="#c4453a"
            />
          )}
          {cleanest && (
            <HighlightRow
              label="Cleanest Kill"
              name={cleanest.boss.name}
              detail={cleanest.deaths === 0 ? 'first try' : `${cleanest.deaths} death${cleanest.deaths !== 1 ? 's' : ''}`}
              accent="#5a8a6e"
            />
          )}
          {rageResult && (
            <HighlightRow
              label="Most Rage"
              name={rageResult.boss.name}
              detail={`${rageResult.rage} consecutive deaths`}
              accent="#c4453a"
            />
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#8a7558', letterSpacing: '1px' }}>
            WUKONG SUFFERING TRACKER
          </p>
        </div>
      </div>
    );
  },
);

StatsCardForExport.displayName = 'StatsCardForExport';

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', color: '#6b5a44', margin: 0, marginBottom: '4px', textTransform: 'uppercase' }}>
        {label}
      </p>
      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '36px', fontWeight: 700, color: '#1f1812', lineHeight: 1 }}>
        {value}
      </span>
    </div>
  );
}

function HighlightRow({ label, name, detail, accent }: {
  label: string; name: string; detail: string; accent: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', color: '#6b5a44', textTransform: 'uppercase', minWidth: '110px' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'Cinzel, "Cormorant SC", serif', fontSize: '15px', fontWeight: 500, color: '#1f1812' }}>
        {name}
      </span>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: accent, marginLeft: 'auto' }}>
        {detail}
      </span>
    </div>
  );
}
