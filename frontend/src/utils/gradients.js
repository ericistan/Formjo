export const GRADIENTS = [
  "from-slate-700 to-slate-900",
  "from-amber-700 to-orange-900",
  "from-indigo-700 to-violet-900",
  "from-teal-700 to-emerald-900",
  "from-rose-700 to-red-900",
  "from-stone-600 to-zinc-800",
];

export const coverGradient = (id) => GRADIENTS[id % GRADIENTS.length];
