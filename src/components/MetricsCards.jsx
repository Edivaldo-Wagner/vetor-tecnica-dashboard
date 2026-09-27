import React from "react";

export default function MetricsCards() {
  const metrics = [
    {
      label: "EM CAMPO",
      value: "2",
      subtext: "técnicos alocados",
      highlight: "text-amber-600",
    },
    {
      label: "ABERTAS",
      value: "1",
      subtext: "aguardando despacho",
      highlight: "text-amber-600",
    },
    {
      label: "CONCLUÍDAS (7D)",
      value: "2",
      subtext: "+12% vs. semana anterior",
      highlight: "text-emerald-600",
    },
    {
      label: "ASSINATURAS PENDENTES",
      value: "1",
      subtext: "OS-2024-0191",
      highlight: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      {metrics.map((item, idx) => (
        <div
          key={idx}
          className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
        >
          <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
            {item.label}
          </p>
          <p className={`text-3xl font-extrabold my-1 ${item.highlight}`}>
            {item.value}
          </p>
          <p className="text-xs text-gray-500">{item.subtext}</p>
        </div>
      ))}
    </div>
  );
}
