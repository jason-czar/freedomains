
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionsTab } from "./billing/SubscriptionsTab";
import { OrderHistoryTab } from "./billing/OrderHistoryTab";
import { PaymentMethodsTab } from "./billing/PaymentMethodsTab";

const BillingTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Manage your Billing</h1>
        <p className="text-gray-400">Review your order history and manage your payment methods</p>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="order-history">Order History</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <SubscriptionsTab />
        </TabsContent>

        <TabsContent value="order-history" className="space-y-4">
          <OrderHistoryTab />
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-4">
          <PaymentMethodsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingTab;
