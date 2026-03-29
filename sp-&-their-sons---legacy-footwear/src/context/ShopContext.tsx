import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, WishlistItem } from '../types';
import { useAuth } from './AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

interface ShopContextType {
  cart: CartItem[];
  wishlist: WishlistItem[];
  addToCart: (product: Product, size: number | string) => void;
  removeFromCart: (productId: string, size: number | string) => void;
  updateQuantity: (productId: string, size: number | string, delta: number) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  cartCount: number;
  cartTotal: number;
  clearCart: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);
const GUEST_CART_KEY = 'legacy-footwear-guest-cart';
const GUEST_WISHLIST_KEY = 'legacy-footwear-guest-wishlist';

const mergeCartItems = (baseCart: CartItem[], incomingCart: CartItem[]) => {
  const mergedCart = [...baseCart];

  incomingCart.forEach((incomingItem) => {
    const existingIndex = mergedCart.findIndex(
      (item) => item.id === incomingItem.id && item.selectedSize === incomingItem.selectedSize,
    );

    if (existingIndex >= 0) {
      mergedCart[existingIndex] = {
        ...mergedCart[existingIndex],
        quantity: mergedCart[existingIndex].quantity + incomingItem.quantity,
      };
      return;
    }

    mergedCart.push(incomingItem);
  });

  return mergedCart;
};

const mergeWishlistItems = (baseWishlist: WishlistItem[], incomingWishlist: WishlistItem[]) => {
  const existingIds = new Set(baseWishlist.map((item) => item.id));
  return [...baseWishlist, ...incomingWishlist.filter((item) => !existingIds.has(item.id))];
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    if (!user) {
      try {
        const guestCart = localStorage.getItem(GUEST_CART_KEY);
        const guestWishlist = localStorage.getItem(GUEST_WISHLIST_KEY);
        setCart(guestCart ? JSON.parse(guestCart) as CartItem[] : []);
        setWishlist(guestWishlist ? JSON.parse(guestWishlist) as WishlistItem[] : []);
      } catch {
        setCart([]);
        setWishlist([]);
      }
      return;
    }

    const cartUnsubscribe = onSnapshot(doc(db, 'users', user.uid, 'cart', 'current'), (snapshot) => {
      const remoteCart = snapshot.exists() ? (snapshot.data().items || []) as CartItem[] : [];
      const guestCart = (() => {
        try {
          const raw = localStorage.getItem(GUEST_CART_KEY);
          return raw ? JSON.parse(raw) as CartItem[] : [];
        } catch {
          return [];
        }
      })();
      const mergedCart = mergeCartItems(remoteCart, guestCart);
      setCart(mergedCart);

      if (guestCart.length > 0) {
        void syncCartForUser(user.uid, mergedCart);
        localStorage.removeItem(GUEST_CART_KEY);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/cart/current`));

    const wishlistUnsubscribe = onSnapshot(doc(db, 'users', user.uid, 'wishlist', 'current'), (snapshot) => {
      const remoteWishlist = snapshot.exists() ? (snapshot.data().items || []) as WishlistItem[] : [];
      const guestWishlist = (() => {
        try {
          const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
          return raw ? JSON.parse(raw) as WishlistItem[] : [];
        } catch {
          return [];
        }
      })();
      const mergedWishlist = mergeWishlistItems(remoteWishlist, guestWishlist);
      setWishlist(mergedWishlist);

      if (guestWishlist.length > 0) {
        void syncWishlistForUser(user.uid, mergedWishlist);
        localStorage.removeItem(GUEST_WISHLIST_KEY);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/wishlist/current`));

    return () => {
      cartUnsubscribe();
      wishlistUnsubscribe();
    };
  }, [user]);

  const syncCartForUser = async (uid: string, newCart: CartItem[]) => {
    try {
      await setDoc(doc(db, 'users', uid, 'cart', 'current'), {
        items: newCart,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}/cart/current`);
    }
  };

  const syncCart = async (newCart: CartItem[]) => {
    if (!user) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newCart));
      return;
    }
    await syncCartForUser(user.uid, newCart);
  };

  const syncWishlistForUser = async (uid: string, newWishlist: WishlistItem[]) => {
    try {
      await setDoc(doc(db, 'users', uid, 'wishlist', 'current'), {
        items: newWishlist,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}/wishlist/current`);
    }
  };

  const syncWishlist = async (newWishlist: WishlistItem[]) => {
    if (!user) {
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(newWishlist));
      return;
    }
    await syncWishlistForUser(user.uid, newWishlist);
  };

  const addToCart = (product: Product, size: number | string) => {
    const newCart = (() => {
      const existing = cart.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return cart.map(item => 
          item.id === product.id && item.selectedSize === size 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...cart, { ...product, selectedSize: size, quantity: 1 }];
    })();
    
    setCart(newCart);
    syncCart(newCart);
  };

  const removeFromCart = (productId: string, size: number | string) => {
    const newCart = cart.filter(item => !(item.id === productId && item.selectedSize === size));
    setCart(newCart);
    syncCart(newCart);
  };

  const updateQuantity = (productId: string, size: number | string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === productId && item.selectedSize === size) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCart(newCart);
    syncCart(newCart);
  };

  const addToWishlist = (product: Product) => {
    if (wishlist.find(item => item.id === product.id)) return;
    const newWishlist = [...wishlist, product];
    setWishlist(newWishlist);
    syncWishlist(newWishlist);
  };

  const removeFromWishlist = (productId: string) => {
    const newWishlist = wishlist.filter(item => item.id !== productId);
    setWishlist(newWishlist);
    syncWishlist(newWishlist);
  };

  const isInWishlist = (productId: string) => wishlist.some(item => item.id === productId);
  
  const clearCart = () => {
    setCart([]);
    syncCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <ShopContext.Provider value={{
      cart, wishlist, addToCart, removeFromCart, updateQuantity,
      addToWishlist, removeFromWishlist, isInWishlist, cartCount, cartTotal, clearCart
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
};
