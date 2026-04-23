"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type ProfileData = {
  completedCount: number;
  skipCount: number;
  crowdAgreementRate: number;
  mostControversial: {
    leftLabel: string;
    rightLabel: string;
    chosenLabel: string;
    crowdPercent: number;
  } | null;
  categoryInsight: {
    highCategory: string;
    lowCategory: string;
    rate: number;
    qualifier: string;
  } | null;
  cycle: {
    a: string;
    b: string;
    c: string;
  } | null;
  personalRanking: {
    id: string;
    label: string;
    winRate: number;
  }[];
};

function ProfileContent() {
  const searchParams = useSearchParams();
  const visitorId = searchParams.get("v");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!visitorId) {
      setError(true);
      setLoading(false);
      return;
    }

    fetch(`/api/profile?visitorId=${encodeURIComponent(visitorId)}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: ProfileData) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [visitorId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Building your profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Could not load your profile. Complete more comparisons first.</p>
        <a href="/" className="text-sm font-semibold text-slate-700 underline underline-offset-4">
          Back to comparisons
        </a>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-lg space-y-5">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Your Awareness Intuitions
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Based on {profile.completedCount} comparison{profile.completedCount === 1 ? "" : "s"}
          </p>
        </div>

        {/* Crowd agreement */}
        <InsightCard accentClass="bg-blue-50 border-blue-100">
          <p className="text-sm text-slate-500">You agree with the crowd</p>
          <p className="text-5xl font-black tabular-nums text-slate-900">
            {profile.crowdAgreementRate}%
          </p>
          <p className="text-xs text-slate-400">of the time</p>
        </InsightCard>

        {/* Most controversial */}
        {profile.mostControversial && (
          <InsightCard accentClass="bg-amber-50 border-amber-100">
            <p className="text-sm text-slate-500">Your most controversial pick</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {profile.mostControversial.chosenLabel}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              over {profile.mostControversial.leftLabel === profile.mostControversial.chosenLabel
                ? profile.mostControversial.rightLabel
                : profile.mostControversial.leftLabel}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Only {profile.mostControversial.crowdPercent}% of people agreed with you
            </p>
          </InsightCard>
        )}

        {/* Category tendency */}
        {profile.categoryInsight && (
          <InsightCard accentClass="bg-emerald-50 border-emerald-100">
            <p className="text-sm text-slate-500">You rank</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {profile.categoryInsight.highCategory}
            </p>
            <p className="text-sm text-slate-500">
              above {profile.categoryInsight.lowCategory}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {profile.categoryInsight.rate}% of the time &mdash; {profile.categoryInsight.qualifier}
            </p>
          </InsightCard>
        )}

        {/* Transitivity cycle */}
        {profile.cycle && (
          <InsightCard accentClass="bg-violet-50 border-violet-100">
            <p className="text-sm text-slate-500">A loop in your logic</p>
            <div className="mt-2 flex items-center justify-center gap-2 text-base font-semibold text-slate-900">
              <span>{profile.cycle.a}</span>
              <span className="text-slate-400">&gt;</span>
              <span>{profile.cycle.b}</span>
              <span className="text-slate-400">&gt;</span>
              <span>{profile.cycle.c}</span>
              <span className="text-slate-400">&gt;</span>
              <span>{profile.cycle.a}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Awareness intuitions aren&apos;t always transitive
            </p>
          </InsightCard>
        )}

        {/* Personal top 5 */}
        {profile.personalRanking.length > 0 && (
          <InsightCard accentClass="bg-slate-50 border-slate-200">
            <p className="text-sm text-slate-500">Your top-rated entities</p>
            <div className="mt-3 space-y-2">
              {profile.personalRanking.map((entry, i) => (
                <div key={entry.id} className="flex items-center gap-3">
                  <span className="w-5 text-right text-sm font-bold text-slate-400">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">{entry.label}</span>
                      <span className="text-xs tabular-nums text-slate-500">{entry.winRate}%</span>
                    </div>
                    <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-slate-900 transition-all duration-500"
                        style={{ width: `${entry.winRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </InsightCard>
        )}

        {/* Skip count if any */}
        {profile.skipCount > 0 && (
          <p className="text-center text-xs text-slate-400">
            You skipped {profile.skipCount} pair{profile.skipCount === 1 ? "" : "s"} — that&apos;s okay, it&apos;s a hard question.
          </p>
        )}

        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              const text = `I completed ${profile.completedCount} comparisons on Awareometer and agree with the crowd ${profile.crowdAgreementRate}% of the time.${profile.cycle ? ` My logic has a loop: ${profile.cycle.a} > ${profile.cycle.b} > ${profile.cycle.c} > ${profile.cycle.a}.` : ""}`;
              if (navigator.share) {
                navigator.share({ text });
              } else {
                navigator.clipboard.writeText(text);
              }
            }}
            className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-2xl"
          >
            Share my results
          </button>
          <a
            href="/"
            className="text-sm text-slate-500 transition hover:text-slate-700"
          >
            Keep comparing
          </a>
        </div>
      </div>
    </main>
  );
}

function InsightCard({ children, accentClass }: { children: React.ReactNode; accentClass: string }) {
  return (
    <div className={`insight-card rounded-2xl border px-6 py-6 text-center ${accentClass}`}>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
