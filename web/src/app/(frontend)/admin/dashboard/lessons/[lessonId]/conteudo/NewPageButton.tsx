import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { Plus } from "lucide-react";

interface NewPageButtonProps {
  isPrincipalActive: boolean;
  headerButtonDisabled: boolean;
  headerButtonLabel: string;
  setShowNewPageDialog: (value: boolean) => void;
  setShowNewVariantPageDialog: (value: boolean) => void;
  className?: string;
}

function NewPageButton({ className, isPrincipalActive, setShowNewPageDialog, setShowNewVariantPageDialog, headerButtonDisabled, headerButtonLabel }: NewPageButtonProps) {
  return (
    <Button
      className={clsx("admin-header-button", className)}
      onClick={() => {
        if (isPrincipalActive) setShowNewPageDialog(true);
        else setShowNewVariantPageDialog(true);
      }}
      disabled={headerButtonDisabled}
    >
      <Plus className="w-4 h-4" />
      {headerButtonLabel}
    </Button>
   );
}

export default NewPageButton;