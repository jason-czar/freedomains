
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, CheckCircle, XCircle } from "lucide-react";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface PaymentMethodFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  cardNumber: z.string()
    .min(16, "Card number must have at least 16 digits")
    .max(19, "Card number cannot exceed 19 digits")
    .regex(/^[0-9]+$/, "Card number must contain only digits"),
  expiryMonth: z.string()
    .min(1, "Expiry month is required")
    .max(2, "Expiry month cannot exceed 2 digits")
    .regex(/^(0?[1-9]|1[0-2])$/, "Expiry month must be between 1-12"),
  expiryYear: z.string()
    .min(2, "Expiry year is required")
    .max(4, "Expiry year cannot exceed 4 digits")
    .regex(/^[0-9]+$/, "Expiry year must contain only digits"),
  cvc: z.string()
    .min(3, "CVC must have at least 3 digits")
    .max(4, "CVC cannot exceed 4 digits")
    .regex(/^[0-9]+$/, "CVC must contain only digits"),
  name: z.string()
    .min(3, "Name must have at least 3 characters")
    .max(100, "Name is too long"),
});

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvc: "",
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to add a payment method");
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real implementation, this would securely tokenize the card via Stripe or another provider
      // For this example, we're simulating a successful card addition

      // For security, we only store minimal information about the card
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

  const detectCardBrand = (cardNumber: string): string => {
    // Simple regex patterns to detect card brand
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
    };

    if (patterns.visa.test(cardNumber)) return "visa";
    if (patterns.mastercard.test(cardNumber)) return "mastercard";
    if (patterns.amex.test(cardNumber)) return "amex";
    if (patterns.discover.test(cardNumber)) return "discover";
    return "unknown";
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
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Cardholder Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John Doe" 
                    {...field} 
                    className="bg-black/40 border border-gray-700 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Card Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="4242 4242 4242 4242" 
                    {...field} 
                    className="bg-black/40 border border-gray-700 text-white"
                    maxLength={19}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="expiryMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Month</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="MM" 
                      {...field} 
                      className="bg-black/40 border border-gray-700 text-white"
                      maxLength={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiryYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Year</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="YY" 
                      {...field} 
                      className="bg-black/40 border border-gray-700 text-white"
                      maxLength={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cvc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">CVC</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="CVC" 
                      {...field} 
                      className="bg-black/40 border border-gray-700 text-white"
                      maxLength={4}
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-gray-700 text-gray-300"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-emerald-500 to-green-400 text-gray-900"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Save Card
                </>
              )}
            </Button>
          </div>
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
