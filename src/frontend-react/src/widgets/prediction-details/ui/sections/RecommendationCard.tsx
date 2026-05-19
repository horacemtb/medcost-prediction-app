import { ShieldAlert } from "lucide-react";
import { Panel } from "../../../../shared/ui/kit";
import { formatDate } from "../../model/prediction-details-helpers";

type RecommendationCardProps = {
  createdAt: string;
  riskProfileCategory?: string | null;
  title?: string | null;
  description?: string | null;
};

export function RecommendationCard({
  createdAt,
  riskProfileCategory,
  title,
  description,
}: RecommendationCardProps) {
  if (!riskProfileCategory || !title || !description) {
    return (
      <Panel
        as="article"
        borderClassName="border-[#e5e7eb]"
        surfaceClassName="bg-white"
        className="min-w-0"
      >
        <p className="m-0 text-ui-sm text-[#6b7280]">Нет данных</p>
      </Panel>
    );
  }

  const tone =
    riskProfileCategory === "Низкий"
      ? {
          border: "border-[#cae8d2]",
          surface: "bg-[#effcf3]",
          title: "text-[#14532d]",
          text: "text-[#2f5f43]",
          muted: "text-[#5f8c6f]",
          line: "bg-[#cfe8d6]",
          icon: "text-[#1f9d57]",
        }
      : riskProfileCategory === "Стандартный"
        ? {
            border: "border-[#f0d7bb]",
            surface: "bg-[#fff5e8]",
            title: "text-[#2c1f13]",
            text: "text-[#5f4f3c]",
            muted: "text-[#8d6b49]",
            line: "bg-[#ead4bd]",
            icon: "text-[#8a5a25]",
          }
        : riskProfileCategory === "Высокий риск"
          ? {
              border: "border-[#ffd7b2]",
              surface: "bg-[#fff0e3]",
              title: "text-[#5e2d0d]",
              text: "text-[#744725]",
              muted: "text-[#9a6034]",
              line: "bg-[#f2cfb1]",
              icon: "text-[#c95f1c]",
            }
          : {
              border: "border-[#f3c4c4]",
              surface: "bg-[#fff0f0]",
              title: "text-[#7a1f1f]",
              text: "text-[#7f3535]",
              muted: "text-[#a54d4d]",
              line: "bg-[#efc6c6]",
              icon: "text-[#d14343]",
            };

  return (
    <Panel
      as="article"
      borderClassName={tone.border}
      surfaceClassName={tone.surface}
      className="min-w-0"
    >
      <p className={`m-0 inline-flex items-center gap-2 text-ui-xs uppercase tracking-[0.2em] ${tone.muted}`}>
        <ShieldAlert className={`size-4 ${tone.icon}`} />
        Рекомендация
      </p>
      <p className={`m-0 mt-2 text-ui-sm font-semibold leading-tight ${tone.title}`}>
        {title}
      </p>
      <div className="my-1 h-px" />
      <p className={`m-0 text-ui-sm ${tone.text}`}>
        {description}
      </p>
      <div className={`my-4 h-px ${tone.line}`} />
      <p className={`m-0 text-ui-xs ${tone.muted}`}>
        Сформировано автоматически на основании отчета от {formatDate(createdAt)}.
      </p>
    </Panel>
  );
}
