import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  push,
  onValue,
  update,
  remove,
  set,
  Database,
} from 'firebase/database';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';
import { Order, MenuItem } from '../types';

export const firebaseConfig = {
  apiKey: "AIzaSyBneR5NzT3OdBM7AdBX3WSfe5sklXaFoJg",
  authDomain: "lmj-kiosk.firebaseapp.com",
  projectId: "lmj-kiosk",
  storageBucket: "lmj-kiosk.firebasestorage.app",
  messagingSenderId: "594738340122",
  appId: "1:594738340122:web:3483c647d2cbbc11590ca3",
  databaseURL: "https://lmj-kiosk-default-rtdb.firebaseio.com",
};

// Initialize Firebase App instance safely
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let rtdb: Database | null = null;
let firestoreDb: Firestore | null = null;

try {
  rtdb = getDatabase(app);
} catch (e) {
  console.warn('Realtime Database initialization warning:', e);
}

try {
  firestoreDb = getFirestore(app);
} catch (e) {
  console.warn('Firestore initialization warning:', e);
}

// ----------------------------------------------------
// REALTIME ORDERS SYNCING (RTDB + Firestore dual-support)
// ----------------------------------------------------

export function subscribeOrders(
  onOrdersUpdated: (orders: Order[]) => void
): () => void {
  let unsubFirestore: (() => void) | null = null;
  let unsubRtdb: (() => void) | null = null;

  // Try RTDB listener first
  if (rtdb) {
    try {
      const ordersRef = ref(rtdb, 'orders');
      unsubRtdb = onValue(
        ordersRef,
        (snapshot) => {
          const val = snapshot.val();
          if (val) {
            const list: Order[] = Object.entries(val).map(([key, data]: [string, any]) => ({
              id: key,
              shortId: data.shortId || key.slice(-4).toUpperCase(),
              items: data.items || [],
              total: data.total || 0,
              status: data.status || 'pending',
              handler: data.handler || '',
              completedCategories: data.completedCategories || {},
              timestamp: data.timestamp || Date.now(),
            }));
            // Sort newest first
            list.sort((a, b) => b.timestamp - a.timestamp);
            onOrdersUpdated(list);
          } else {
            onOrdersUpdated([]);
          }
        },
        (error) => {
          console.warn('RTDB Listener error, falling back to Firestore if available:', error);
        }
      );
    } catch (err) {
      console.warn('RTDB attach error:', err);
    }
  }

  // Also subscribe to Firestore if available as backup or primary
  if (firestoreDb) {
    try {
      const colRef = collection(firestoreDb, 'orders');
      unsubFirestore = onSnapshot(
        colRef,
        (snapshot) => {
          if (!unsubRtdb && !snapshot.empty) {
            const list: Order[] = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                shortId: data.shortId || docSnap.id.slice(-4).toUpperCase(),
                items: data.items || [],
                total: data.total || 0,
                status: data.status || 'pending',
                handler: data.handler || '',
                completedCategories: data.completedCategories || {},
                timestamp: data.timestamp || Date.now(),
              };
            });
            list.sort((a, b) => b.timestamp - a.timestamp);
            onOrdersUpdated(list);
          }
        },
        (err) => {
          console.warn('Firestore listener warning:', err);
        }
      );
    } catch (e) {
      console.warn('Firestore attach error:', e);
    }
  }

  return () => {
    if (unsubRtdb) unsubRtdb();
    if (unsubFirestore) unsubFirestore();
  };
}

export async function pushOrderToFirebase(orderData: Omit<Order, 'id'>): Promise<string> {
  let createdId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  // Push to RTDB
  if (rtdb) {
    try {
      const ordersRef = ref(rtdb, 'orders');
      const newRef = push(ordersRef);
      if (newRef.key) {
        createdId = newRef.key;
        await set(newRef, {
          shortId: orderData.shortId,
          items: orderData.items,
          total: orderData.total,
          status: orderData.status,
          handler: orderData.handler,
          completedCategories: orderData.completedCategories || {},
          timestamp: orderData.timestamp,
        });
      }
    } catch (err) {
      console.warn('Failed to push to RTDB:', err);
    }
  }

  // Push to Firestore as well
  if (firestoreDb) {
    try {
      const docRef = doc(collection(firestoreDb, 'orders'), createdId);
      await setDoc(docRef, {
        shortId: orderData.shortId,
        items: orderData.items,
        total: orderData.total,
        status: orderData.status,
        handler: orderData.handler,
        timestamp: orderData.timestamp,
      });
    } catch (err) {
      console.warn('Failed to push to Firestore:', err);
    }
  }

  return createdId;
}

export async function updateOrderInFirebase(
  orderId: string,
  updates: Partial<Order>
): Promise<void> {
  if (rtdb) {
    try {
      const orderRef = ref(rtdb, `orders/${orderId}`);
      await update(orderRef, updates);
    } catch (err) {
      console.warn('Failed to update RTDB order:', err);
    }
  }

  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, 'orders', orderId);
      await updateDoc(docRef, updates as any);
    } catch (err) {
      console.warn('Failed to update Firestore order:', err);
    }
  }
}

export async function deleteSingleOrderInFirebase(orderId: string): Promise<void> {
  if (rtdb) {
    try {
      const orderRef = ref(rtdb, `orders/${orderId}`);
      await remove(orderRef);
    } catch (err) {
      console.warn('Failed to delete RTDB order:', err);
    }
  }

  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, 'orders', orderId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Failed to delete Firestore order:', err);
    }
  }
}

export async function clearAllOrdersInFirebase(orders: Order[]): Promise<void> {
  if (rtdb) {
    try {
      const ordersRef = ref(rtdb, 'orders');
      await remove(ordersRef);
    } catch (err) {
      console.warn('Failed to remove RTDB orders:', err);
    }
  }

  if (firestoreDb) {
    try {
      const promises = orders.map((o) => deleteDoc(doc(firestoreDb!, 'orders', o.id)));
      await Promise.all(promises);
    } catch (err) {
      console.warn('Failed to delete Firestore orders:', err);
    }
  }
}
