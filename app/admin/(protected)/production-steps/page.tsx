import { listProductionSteps } from "@/lib/services/production-step.service";
import { ProductionStepsClient } from "./ProductionStepsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductionStepsPage() {
  const productionSteps = await listProductionSteps();

  return (
    <div>
      <h1 className="mb-6 font-heading text-xl text-brown-deep">Production steps</h1>
      <ProductionStepsClient initialProductionSteps={productionSteps} />
    </div>
  );
}
