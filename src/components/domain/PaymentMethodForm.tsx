
import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, type PaymentFormValues } from "./payment/payment-form-schema";
import { PaymentFormFields } from "./payment/PaymentFormFields";
import { PaymentFormFooter } from "./payment/PaymentFormFooter";
import { useCardBrand } from "./payment/use-card-brand";

interface PaymentMethodFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { detectCardBrand } = useCardBrand();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvc: "",
      name: "",
    },
  });

  const onSubmit = async (values: PaymentFormValues) => {
    if (!user) {
      toast.error("You must be logged in to add a payment method");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("payment_methods").insert({
        user_id: user.id,
        last_four: values.cardNumber.slice(-4),
        brand: detectCardBrand(values.cardNumber),
        expiry_month: values.expiryMonth,
        expiry_year: values.expiryYear.length === 2 ? `20${values.expiryYear}` : values.expiryYear,
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      toast.success("Payment method added successfully");
      onSuccess();
    } catch (error: any) {
      console.error("Error adding payment method:", error);
      toast.error("Failed to add payment method: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 p-6 bg-black/40 backdrop-blur-sm border border-gray-800/50 rounded-xl">
      <h3 className="text-xl font-bold mb-4 text-white">Add Payment Method</h3>
      <p className="text-gray-400 mb-4">
        Your card will not be charged now. Your domain is free for the first year, then renews at $19.99/year.
        If you added email service, you will be billed $4.99/month starting today.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <PaymentFormFields form={form} />
          <PaymentFormFooter isSubmitting={isSubmitting} onCancel={onCancel} />
        </form>
      </Form>

      <div className="mt-4 border-t border-gray-800 pt-4">
        <p className="text-gray-400 text-sm">
          Your payment information is securely processed and stored.
          By adding a payment method, you agree to our terms of service regarding automatic renewals.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodForm;
