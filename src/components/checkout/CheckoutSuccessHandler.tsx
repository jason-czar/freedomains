import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function CheckoutSuccessHandler() {
  const [searchParams] = useSearchParams();
  const checkoutSuccess = searchParams.get("checkout_success") === "true";
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (checkoutSuccess && sessionId) {
      handleCheckoutSuccess(sessionId);
    }
  }, [checkoutSuccess, sessionId]);

  const handleCheckoutSuccess = async (sessionId: string) => {
    try {
      // Notify the user that we're processing their payment
      toast.success("Payment successful! Processing your domain registration...");
      
      // Call a function to verify the checkout status and ensure domain registration completed
      const { data, error } = await supabase.functions.invoke("verify-checkout", {
        body: {
          session_id: sessionId
        }
      });

      if (error) {
        console.error("Error verifying checkout:", error);
        toast.error("There was an issue processing your domain registration. Our team has been notified.");
        return;
      }

      if (data?.success) {
        toast.success(data.message || "Domain registration completed successfully!");
      } else {
        toast.info(data?.message || "Your payment was successful, but domain registration is still processing. This may take a few minutes.");
      }
      
      // Clean up the URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout_success");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.toString());
      
    } catch (error) {
      console.error("Error handling checkout success:", error);
      toast.error("There was an issue processing your domain registration. Our team has been notified.");
    }
  };

  return null; // This component doesn't render anything
}
