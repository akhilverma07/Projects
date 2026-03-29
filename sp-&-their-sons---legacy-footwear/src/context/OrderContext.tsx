import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ContactMessage, Expense, NewsletterSubscriber, Order, OrderStatus, PaymentMethod, PaymentStatus } from '../types';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ADMIN_EMAIL, useAuth } from './AuthContext';

const toIsoString = (value: unknown) => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return undefined;
};

const sortByCreatedAtDesc = <T extends { createdAt: string }>(items: T[]) => (
  [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
);

interface CreateOrderInput {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  pincode: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderForSomeoneElse: boolean;
  recipientName?: string;
  recipientPhone?: string;
  items: Order['items'];
  subtotal: number;
  shipping: number;
  total: number;
}

interface OrderContextType {
  orders: Order[];
  expenses: Expense[];
  contactMessages: ContactMessage[];
  newsletterSubscribers: NewsletterSubscriber[];
  createOrder: (input: CreateOrderInput) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  markOrderAsRead: (orderId: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  removeExpense: (expenseId: string) => void;
  addContactMessage: (message: Omit<ContactMessage, 'id' | 'createdAt'>) => void;
  addNewsletterSubscriber: (email: string) => Promise<{ status: 'created' | 'exists' }>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);

  useEffect(() => {
    if (loading) {
      return undefined;
    }

    if (!user) {
      setOrders([]);
      setExpenses([]);
      setContactMessages([]);
      setNewsletterSubscribers([]);
      return undefined;
    }

    const isAdmin = user.role === 'admin' || user.email.trim().toLowerCase() === ADMIN_EMAIL;
    const ordersQuery = isAdmin
      ? query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'orders'), where('userId', '==', user.uid));

    const unsubscribeOrders = onSnapshot(
      ordersQuery,
      (snapshot) => setOrders(sortByCreatedAtDesc(snapshot.docs.map((snapshotDoc) => {
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
      }))),
      (error) => handleFirestoreError(error, OperationType.LIST, 'orders'),
    );

    if (!isAdmin) {
      setExpenses([]);
      setContactMessages([]);
      setNewsletterSubscribers([]);

      return () => {
        unsubscribeOrders();
      };
    }

    const unsubscribeExpenses = onSnapshot(
      query(collection(db, 'expenses'), orderBy('createdAt', 'desc')),
      (snapshot) => setExpenses(snapshot.docs.map((snapshotDoc) => {
        const data = snapshotDoc.data();
        return {
          id: snapshotDoc.id,
          ...data,
          createdAt: toIsoString(data.createdAt) || new Date().toISOString(),
        } as Expense;
      })),
      (error) => handleFirestoreError(error, OperationType.LIST, 'expenses'),
    );

    const unsubscribeMessages = onSnapshot(
      query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc')),
      (snapshot) => setContactMessages(snapshot.docs.map((snapshotDoc) => {
        const data = snapshotDoc.data();
        return {
          id: snapshotDoc.id,
          ...data,
          createdAt: toIsoString(data.createdAt) || new Date().toISOString(),
        } as ContactMessage;
      })),
      (error) => handleFirestoreError(error, OperationType.LIST, 'contactMessages'),
    );

    const unsubscribeNewsletter = onSnapshot(
      query(collection(db, 'newsletterSubscribers'), orderBy('createdAt', 'desc')),
      (snapshot) => setNewsletterSubscribers(snapshot.docs.map((snapshotDoc) => {
        const data = snapshotDoc.data();
        return {
          id: snapshotDoc.id,
          ...data,
          createdAt: toIsoString(data.createdAt) || new Date().toISOString(),
        } as NewsletterSubscriber;
      })),
      (error) => handleFirestoreError(error, OperationType.LIST, 'newsletterSubscribers'),
    );

    return () => {
      unsubscribeOrders();
      unsubscribeExpenses();
      unsubscribeMessages();
      unsubscribeNewsletter();
    };
  }, [loading, user]);

  const value = useMemo<OrderContextType>(() => ({
    orders,
    expenses,
    contactMessages,
    newsletterSubscribers,
    createOrder: (input) => {
      const orderPayload = {
        ...input,
        status: 'Placed' as OrderStatus,
        isNew: true,
        createdAt: new Date().toISOString(),
        statusUpdatedAt: new Date().toISOString(),
      };

      void addDoc(collection(db, 'orders'), {
        ...orderPayload,
        createdAt: serverTimestamp(),
        statusUpdatedAt: serverTimestamp(),
      }).catch((error) => handleFirestoreError(error, OperationType.CREATE, 'orders'));

      return {
        id: '',
        ...orderPayload,
      };
    },
    updateOrderStatus: async (orderId, status) => {
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          status,
          isNew: false,
          adminViewedAt: serverTimestamp(),
          statusUpdatedAt: serverTimestamp(),
          deliveredAt: status === 'Delivered' ? serverTimestamp() : null,
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
      }
    },
    markOrderAsRead: async (orderId) => {
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          isNew: false,
          adminViewedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
      }
    },
    addExpense: async (expense) => {
      try {
        await addDoc(collection(db, 'expenses'), {
          ...expense,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'expenses');
      }
    },
    removeExpense: async (expenseId) => {
      try {
        await deleteDoc(doc(db, 'expenses', expenseId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `expenses/${expenseId}`);
      }
    },
    addContactMessage: async (message) => {
      try {
        await addDoc(collection(db, 'contactMessages'), {
          ...message,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'contactMessages');
      }
    },
    addNewsletterSubscriber: async (email) => {
      const normalizedEmail = email.trim().toLowerCase();
      const alreadyExists = newsletterSubscribers.some((subscriber) => subscriber.email.toLowerCase() === normalizedEmail);

      if (alreadyExists) {
        return { status: 'exists' as const };
      }

      try {
        await addDoc(collection(db, 'newsletterSubscribers'), {
          email: normalizedEmail,
          createdAt: serverTimestamp(),
        });
        return { status: 'created' as const };
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'newsletterSubscribers');
        throw error;
      }
    },
  }), [contactMessages, expenses, newsletterSubscribers, orders]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within OrderProvider');
  return context;
};
