import React from 'react';

interface OrdersScreenProps {
  [key: string]: any;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = () => {
  return (
    <div className="p-4 max-w-md mx-auto text-white">
      <h2 className="text-lg font-bold">Your Orders</h2>
      <p className="text-xs text-slate-400 mt-1">Track your active and past orders here.</p>
    </div>
  );
};

export default OrdersScreen;
