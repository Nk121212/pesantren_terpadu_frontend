import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react";

interface SummaryCardsProps {
  data: {
    finance: {
      totalIncome: number;
      totalExpense: number;
      net: number;
    };
    savings: number;
  };
}

export default function SummaryCards({ data }: SummaryCardsProps) {
  const { finance, savings } = data;

  const cards = [
    {
      title: "Total Income",
      value: finance.totalIncome,
      formattedValue: `Rp ${finance.totalIncome.toLocaleString("id-ID")}`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Total Expense",
      value: finance.totalExpense,
      formattedValue: `Rp ${finance.totalExpense.toLocaleString("id-ID")}`,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      title: "Net",
      value: finance.net,
      formattedValue: `Rp ${finance.net.toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: finance.net >= 0 ? "text-blue-600" : "text-orange-600",
      bgColor: finance.net >= 0 ? "bg-blue-50" : "bg-orange-50",
      borderColor: finance.net >= 0 ? "border-blue-200" : "border-orange-200",
    },
    {
      title: "Savings",
      value: savings,
      formattedValue: `Rp ${savings.toLocaleString("id-ID")}`,
      icon: PiggyBank,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`bg-white rounded-xl border ${card.borderColor} p-6 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className={`text-2xl font-bold ${card.color} mt-1`}>
                  {card.formattedValue}
                </p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
