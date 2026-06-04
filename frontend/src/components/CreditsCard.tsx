export default function CreditsCard() {
  return (
    <div className="bg-primary-container text-on-primary-container p-gutter rounded-2xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-label-md opacity-80">Credits Remaining</p>
        <h4 className="text-headline-lg">128 min</h4>
      </div>
      <button className="w-12 h-12 rounded-full bg-on-primary-container text-primary-container flex items-center justify-center hover:scale-105 transition-transform shadow-md">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}
