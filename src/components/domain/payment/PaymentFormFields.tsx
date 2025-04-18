
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { PaymentFormValues } from "./payment-form-schema";

interface PaymentFormFieldsProps {
  form: UseFormReturn<PaymentFormValues>;
}

export const PaymentFormFields: React.FC<PaymentFormFieldsProps> = ({ form }) => {
  return (
    <>
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
    </>
  );
};
