import { Suspense } from "react";
import PaymentResult from "../_components/PaymentResult";

export const dynamic = "force-dynamic";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container">Cargando...</div>}>
      <PaymentResult variant="success" />
    </Suspense>
  );
}
