import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import { Product } from '../types';
import { products as seedProducts } from '../data/products';
import { useAuth } from './AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, nextProduct: Product) => void;
  removeProduct: (productId: string) => void;
  getProductById: (productId: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const productsRef = collection(db, 'products');
    const unsubscribe = onSnapshot(productsRef, async (snapshot) => {
      if (!snapshot.empty) {
        setProducts(snapshot.docs.map((snapshotDoc) => snapshotDoc.data() as Product));
        return;
      }

      setProducts(seedProducts);

      if (!isAdmin) return;

      try {
        const batch = writeBatch(db);
        seedProducts.forEach((product) => {
          batch.set(doc(db, 'products', product.id), product);
        });
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'products');
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products'));

    return () => unsubscribe();
  }, [isAdmin]);

  const value = useMemo<ProductContextType>(() => ({
    products,
    addProduct: async (product) => {
      try {
        await setDoc(doc(db, 'products', product.id), product);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
      }
    },
    updateProduct: async (productId, nextProduct) => {
      try {
        await setDoc(doc(db, 'products', productId), nextProduct);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `products/${productId}`);
      }
    },
    removeProduct: async (productId) => {
      try {
        await deleteDoc(doc(db, 'products', productId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
      }
    },
    getProductById: (productId) => products.find(product => product.id === productId),
  }), [products]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within ProductProvider');
  return context;
};
