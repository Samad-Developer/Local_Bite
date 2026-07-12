"use client"

import PageHeader from "@/components/shared/PageHeader";
import type { Discount, DiscountFormData } from "./config";
import { useCrudForm } from "@/hooks/useCrudForm";

const DiscountClient = ({ discounts }: { discounts: Discount[] }) => {
  const handleCreateDiscount = () => {};

  const {

  } = useCrudForm<Discount, DiscountFormData>({
    
  });

  return (
    <>

      <PageHeader
        title="Manage Discounts"
        buttonLabel="Create Discount"
        onButtonClick={handleCreateDiscount}
      />



    </>
  );
};

export default DiscountClient;
