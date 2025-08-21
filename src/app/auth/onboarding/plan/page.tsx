const plans = [
  {
    name: "Basic",
    price: "Rp50.000/bulan",
    features: ["1 user", "Basic support"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "Rp150.000/bulan",
    features: ["5 users", "Priority support", "Analytics"],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Unlimited users", "Dedicated support", "Advanced analytics"],
    highlight: false,
  },
];

export default function PlanPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-100 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl"></div>
      <h2 className="mb-6 text-center text-3xl font-extrabold text-primary">
        Pilih Paket Langganan
      </h2>
      <div className="grid gap-8 md:grid-cols-3 w-full max-w-4xl">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border-2 p-8 shadow-lg transition-transform hover:scale-105 bg-white flex flex-col items-center ${
              plan.highlight
                ? "border-primary ring-2 ring-primary"
                : "border-gray-200"
            }`}
          >
            {plan.highlight && (
              <span className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                Paling Populer
              </span>
            )}
            <h3 className="mb-2 text-2xl font-bold text-primary">
              {plan.name}
            </h3>
            <p className="mb-4 text-xl font-semibold text-gray-700 dark:text-white/60">
              {plan.price}
            </p>
            <ul className="mb-6 list-disc pl-5 text-base text-gray-600 text-left w-full">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button
              className={`w-full rounded-lg px-5 py-2 font-semibold transition-colors ${
                plan.highlight
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-gray-100 text-primary hover:bg-primary hover:text-white"
              }`}
            >
              Pilih Paket
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
