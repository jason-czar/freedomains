
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
    
    // Show a loading toast to indicate the checkout is being created
    const loadingToast = toast.loading("Creating checkout session...");
    
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        user_id: userId,
        domain_name: newDomain,
        domain_suffix: domainSuffix,
        checkout_type: service,
        include_email: service === 'email' ? true : false
      }
    });
    
    // Dismiss the loading toast
    toast.dismiss(loadingToast);

    if (error) {
      console.error("Error creating checkout:", error);
      
      // Display a more helpful error message
      toast.error(
        "Unable to create checkout session. Please ensure your Stripe integration is properly configured.", 
        { duration: 6000 }
      );
      
      // Show a more technical error for debugging
      console.error("Technical details:", JSON.stringify(error));
      throw error;
    }

    if (!data?.url) {
      toast.error("Checkout session created but no URL was returned");
      throw new Error("No checkout URL returned");
    }

    console.log("Redirecting to checkout:", data.url);
    toast.success("Redirecting to Stripe checkout...");
    
    // Short delay before redirect to ensure toast is visible
    setTimeout(() => {
      // Directly navigate to the Stripe checkout URL
      window.location.href = data.url;
    }, 1000);
    
    return data.url;
  } catch (error: any) {
    console.error("Error during checkout:", error);
    toast.error(`Checkout error: ${error.message}`);
    return null;
  }
};
