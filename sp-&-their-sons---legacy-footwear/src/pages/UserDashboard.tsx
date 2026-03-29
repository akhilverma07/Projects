import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Package, ShoppingBag, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Order, PaymentMethod, PaymentStatus } from '../types';

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const formatDateTime = (value?: string) => value
  ? new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  : null;

const toIsoString = (value: unknown) => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return undefined;
};

const UserDashboard = () => {
  const { user, loading } = useAuth();
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) {
      setUserOrders([]);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, 'orders'), where('userId', '==', user.uid)),
      (snapshot) => {
        const nextOrders = snapshot.docs.map((snapshotDoc) => {
          const data = snapshotDoc.data();
          const paymentMethod = (data.paymentMethod as PaymentMethod | undefined)
            ?? ((data.paymentStatus as PaymentStatus | undefined) === 'Paid' ? 'UPI' : 'Cash on Delivery');
          const paymentStatus = (data.paymentStatus as PaymentStatus | undefined)
            ?? (paymentMethod === 'Cash on Delivery' ? 'Cash on Delivery' : 'Paid');

          return {
            ...data,
            id: snapshotDoc.id,
            paymentMethod,
            paymentStatus,
            isNew: Boolean(data.isNew),
            createdAt: toIsoString(data.createdAt) || new Date().toISOString(),
            adminViewedAt: toIsoString(data.adminViewedAt),
            deliveredAt: toIsoString(data.deliveredAt),
            statusUpdatedAt: toIsoString(data.statusUpdatedAt),
          } as Order;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setUserOrders(nextOrders);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  const activeOrders = useMemo(() => (
    userOrders.filter((order) => !['Delivered', 'Cancelled'].includes(order.status))
  ), [userOrders]);
  const completedOrders = useMemo(() => (
    userOrders.filter((order) => ['Delivered', 'Cancelled'].includes(order.status))
  ), [userOrders]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen pb-24">
      <div className="bg-brand-gray py-16 border-b border-white/5 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-black tracking-tighter">MY DASHBOARD</h1>
          <p className="text-white/50 mt-2">Track your orders, delivery status, and order history.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-white/10 bg-brand-gray px-6 py-5">
            <div className="flex items-center gap-3 text-brand-red">
              <ShoppingBag size={18} />
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">Total Orders</p>
            </div>
            <p className="text-3xl font-black mt-3">{userOrders.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-brand-gray px-6 py-5">
            <div className="flex items-center gap-3 text-brand-red">
              <Truck size={18} />
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">Active Orders</p>
            </div>
            <p className="text-3xl font-black mt-3">{activeOrders.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-brand-gray px-6 py-5">
            <div className="flex items-center gap-3 text-brand-red">
              <Package size={18} />
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">Completed</p>
            </div>
            <p className="text-3xl font-black mt-3">{completedOrders.length}</p>
          </div>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-brand-gray p-6 sm:p-8">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-brand-red font-black">Order Status</p>
            <h2 className="text-2xl font-black tracking-tight mt-2">Current orders and delivery updates</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {activeOrders.map((order) => (
              <div key={order.id} className="rounded-3xl border border-white/10 bg-brand-dark/80 p-5">
                <div className="flex flex-col lg:flex-row gap-5 justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-brand-red/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-brand-red">
                        {order.id}
                      </span>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
                        Placed: {formatDate(order.createdAt)}
                      </span>
                      <span className="rounded-full bg-brand-red/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-brand-red">
                        Status: {order.status}
                      </span>
                    </div>
                    <p className="text-lg font-black">{order.customerName}</p>
                    <p className="text-sm text-white/50">{order.deliveryAddress}</p>
                    <p className="text-sm text-white/50">Pincode: {order.pincode}</p>
                    <p className="text-sm text-white/50">Phone: {order.customerPhone}</p>
                    <p className="text-sm text-white/50">Payment: {order.paymentMethod} • {order.paymentStatus}</p>
                    {formatDateTime(order.statusUpdatedAt) && (
                      <p className="text-sm text-white/40">Latest status update: {formatDateTime(order.statusUpdatedAt)}</p>
                    )}
                    {order.orderForSomeoneElse && (
                      <p className="text-sm text-brand-red">
                        Receiver: {order.recipientName} ({order.recipientPhone})
                      </p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 min-w-[170px]">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Current Status</p>
                    <p className="text-2xl font-black mt-2">{order.status}</p>
                    <p className="text-xs text-white/30">Total ₹{order.total}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 space-y-1 text-sm text-white/60">
                  {order.items.map((item) => (
                    <p key={`${order.id}-${item.id}-${item.selectedSize}`}>
                      {item.name} x {item.quantity} ({item.selectedSize})
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {activeOrders.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-brand-dark/50 px-6 py-12 text-center">
                <Package size={32} className="mx-auto text-white/20 mb-4" />
                <p className="text-lg font-black">No active orders</p>
                <p className="text-sm text-white/40 mt-2">Your placed or in-progress orders will appear here.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-brand-gray p-6 sm:p-8">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-brand-red font-black">Order History</p>
            <h2 className="text-2xl font-black tracking-tight mt-2">Previous delivered and cancelled orders</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {completedOrders.map((order) => (
              <div key={order.id} className="rounded-3xl border border-white/10 bg-brand-dark/80 p-5">
                <div className="flex flex-col lg:flex-row gap-5 justify-between">
                  <div>
                    <p className="text-lg font-black">{order.id}</p>
                    <p className="text-sm text-white/50">
                      {order.deliveredAt ? `Delivered: ${formatDate(order.deliveredAt)}` : `Placed: ${formatDate(order.createdAt)}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black">{order.status}</p>
                    <p className="text-sm text-white/40">₹{order.total}</p>
                    <p className="text-sm text-white/40">{order.paymentMethod} • {order.paymentStatus}</p>
                    {formatDateTime(order.statusUpdatedAt) && <p className="text-sm text-white/40">{formatDateTime(order.statusUpdatedAt)}</p>}
                  </div>
                </div>
              </div>
            ))}

            {completedOrders.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-brand-dark/50 px-6 py-12 text-center">
                <ShoppingBag size={32} className="mx-auto text-white/20 mb-4" />
                <p className="text-lg font-black">No order history yet</p>
                <p className="text-sm text-white/40 mt-2">Delivered and cancelled orders will appear here for future reference.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserDashboard;
