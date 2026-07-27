import PageHeader from "@/components/shared/PageHeader";
import OrderWrapper from "./order-wrapper";
import { Suspense } from "react";

export default async function OrdersPage() {
  return (
    <>
      <PageHeader
        title="Realtime Orders"
        buttonLabel=""
        onButtonClick={() => {}}
        isAddNewButtonVisible={false}
      />

      <Suspense fallback={<h1>loading...</h1>}>
        <OrderWrapper />
      </Suspense>
    </>
  );
}
