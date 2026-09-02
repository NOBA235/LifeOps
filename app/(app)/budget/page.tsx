import { PageHeader } from "@/components/layout/PageHeader";
import { BudgetBreakdown } from "@/components/budget/BudgetBreakdown";
import { RecordExpenseForm } from "@/components/budget/RecordExpenseForm";

export default function BudgetPage() {
  return (
    <div>
      <PageHeader
        title="Budget"
        description="The agent checks this before every booking, and never spends without staying inside it."
      />
      <div className="space-y-4 px-5 py-5 md:px-8">
        <BudgetBreakdown />
        <RecordExpenseForm />
      </div>
    </div>
  );
}
