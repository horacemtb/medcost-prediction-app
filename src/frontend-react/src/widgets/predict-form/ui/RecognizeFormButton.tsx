import { ScanText } from "lucide-react";
import { KitButton } from "../../../shared/ui/kit";

type RecognizeFormButtonProps = {
  loading: boolean;
  onClick: () => void;
};

export function RecognizeFormButton({
  loading,
  onClick,
}: RecognizeFormButtonProps) {
  return (
    <KitButton
      type="button"
      className="h-10 rounded-xl border border-line/70 bg-white px-4 text-ui-sm font-medium text-txt hover:bg-[#f4f7ff]"
      disabled={loading}
      onClick={onClick}
    >
      <ScanText className="size-4" />
      {loading ? "Распознаем..." : "Распознать анкету"}
    </KitButton>
  );
}
