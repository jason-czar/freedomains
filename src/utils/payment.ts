
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const checkPaymentMethod = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("payment_methods")
      .select("id")
      .eq("user_id", userId)
      .limit(1);
    
    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking payment method:", error);
    return false;
  }
};

export const redirectToStripeCheckout = async (
  service: 'domain' | 'email',
  userId: string | undefined,
  newDomain: string,
  domainSuffix: string
) => {
  if (!userId) {
    toast.error("You must be logged in to make a purchase");
    return null;
  }

  try {
    console.log(`Creating checkout for ${service} service...`);
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        service,
        domainName: `${newDomain}.${domainSuffix}`
      }
    });

    if (error) {
      console.error("Error creating checkout:", error);
      throw error;
    }

    if (!data?.url) {
      throw new Error("No checkout URL returned");
    }

    console.log("Redirecting to checkout:", data.url);
    return data.url;
  } catch (error: any) {
    console.error("Error during checkout:", error);
    toast.error(`Checkout error: ${error.message}`);
    return null;
  }
};
