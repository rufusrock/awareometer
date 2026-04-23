type UncertaintyModalProps = {
  onGoBack: () => void;
  onSkip: () => void;
};

export function UncertaintyModal({ onGoBack, onSkip }: UncertaintyModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
        onClick={onGoBack}
      />
      <div className="modal-enter relative w-full max-w-md rounded-2xl bg-white px-6 py-8 shadow-2xl sm:px-8 sm:py-10">
        <div className="space-y-4 text-center">
          <p className="text-lg font-semibold text-slate-900">
            You do not need to be certain.
          </p>
          <p className="text-sm leading-relaxed text-slate-500">
            There is no official definition of awareness here.
          </p>
          <p className="text-sm leading-relaxed text-slate-500">
            Even if both seem aware, or neither does, pick the one that
            seems <em>more</em> aware if you can.
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            onClick={onGoBack}
            className="flex-1 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Go back and choose
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            Skip this pair
          </button>
        </div>
      </div>
    </div>
  );
}
