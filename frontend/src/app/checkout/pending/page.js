import { Suspense } from "react";
import PaymentResult from "../_components/PaymentResult";

export const dynamic = "force-dynamic";

export default function CheckoutPendingPage() {
  return (
    <Suspense fallback={<div className="container">Cargando...</div>}>
      <PaymentResult variant="pending" />
    </Suspense>
  );
}
