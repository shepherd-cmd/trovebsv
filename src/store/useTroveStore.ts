import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Session } from '@supabase/supabase-js';

interface UserSlice {
  user: User | null;
  session: Session | null;
  paymail: string | null;
  isLifetime: boolean;
  freeInscriptionsLeft: number;
  badge: string | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setPaymail: (paymail: string | null) => void;
  setIsLifetime: (isLifetime: boolean) => void;
  setFreeInscriptionsLeft: (count: number) => void;
  setBadge: (badge: string | null) => void;
  clearUser: () => void;
}

interface TreasurySlice {
  balanceBSV: number;
  totalSponsored: number;
  totalRoyaltiesPaid: number;
  setBalanceBSV: (balance: number) => void;
  setTotalSponsored: (total: number) => void;
  setTotalRoyaltiesPaid: (total: number) => void;
}

interface ProvenanceSlice {
  lastScore: number | null;
  lastDescription: string;
  lastReportTx: string | null;
  setProvenanceResult: (score: number, description: string) => void;
  setLastReportTx: (txid: string | null) => void;
  clearProvenance: () => void;
}

interface UISlice {
  activeTab: string;
  cameraActive: boolean;
  ambientSoundMuted: boolean;
  setActiveTab: (tab: string) => void;
  setCameraActive: (active: boolean) => void;
  setAmbientSoundMuted: (muted: boolean) => void;
}

interface DocumentSlice {
  documents: any[];
  selectedDocument: any | null;
  setDocuments: (documents: any[]) => void;
  setSelectedDocument: (document: any | null) => void;
}

type TroveStore = UserSlice & TreasurySlice & ProvenanceSlice & UISlice & DocumentSlice;

export const useTroveStore = create<TroveStore>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      paymail: null,
      isLifetime: false,
      freeInscriptionsLeft: 0,
      badge: null,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setPaymail: (paymail) => set({ paymail }),
      setIsLifetime: (isLifetime) => set({ isLifetime }),
      setFreeInscriptionsLeft: (count) => set({ freeInscriptionsLeft: count }),
      setBadge: (badge) => set({ badge }),
      clearUser: () => set({ 
        user: null, 
        session: null, 
        paymail: null, 
        isLifetime: false, 
        freeInscriptionsLeft: 0,
        badge: null 
      }),

      balanceBSV: 0,
      totalSponsored: 0,
      totalRoyaltiesPaid: 0,
      setBalanceBSV: (balance) => set({ balanceBSV: balance }),
      setTotalSponsored: (total) => set({ totalSponsored: total }),
      setTotalRoyaltiesPaid: (total) => set({ totalRoyaltiesPaid: total }),

      lastScore: null,
      lastDescription: '',
      lastReportTx: null,
      setProvenanceResult: (score, description) => 
        set({ lastScore: score, lastDescription: description }),
      setLastReportTx: (txid) => set({ lastReportTx: txid }),
      clearProvenance: () => 
        set({ lastScore: null, lastDescription: '', lastReportTx: null }),

      activeTab: 'home',
      cameraActive: false,
      ambientSoundMuted: false,
      setActiveTab: (tab) => set({ activeTab: tab }),
      setCameraActive: (active) => set({ cameraActive: active }),
      setAmbientSoundMuted: (muted) => set({ ambientSoundMuted: muted }),

      documents: [],
      selectedDocument: null,
      setDocuments: (documents) => set({ documents }),
      setSelectedDocument: (document) => set({ selectedDocument: document }),
    }),
    {
      name: 'trove-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined' && 'indexedDB' in window) {
          return {
            getItem: async (name) => {
              const db = await openDB();
              return db.get(name);
            },
            setItem: async (name, value) => {
              const db = await openDB();
              await db.set(name, value);
            },
            removeItem: async (name) => {
              const db = await openDB();
              await db.delete(name);
            },
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        paymail: state.paymail,
        isLifetime: state.isLifetime,
        freeInscriptionsLeft: state.freeInscriptionsLeft,
        badge: state.badge,
        ambientSoundMuted: state.ambientSoundMuted,
        lastScore: state.lastScore,
        lastDescription: state.lastDescription,
        lastReportTx: state.lastReportTx,
      }),
    }
  )
);

async function openDB(): Promise<any> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('trove-store', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      resolve({
        get: (key: string) => new Promise((res, rej) => {
          const transaction = db.transaction(['store'], 'readonly');
          const store = transaction.objectStore('store');
          const req = store.get(key);
          req.onsuccess = () => res(req.result);
          req.onerror = () => rej(req.error);
        }),
        set: (key: string, value: any) => new Promise((res, rej) => {
          const transaction = db.transaction(['store'], 'readwrite');
          const store = transaction.objectStore('store');
          const req = store.put(value, key);
          req.onsuccess = () => res(undefined);
          req.onerror = () => rej(req.error);
        }),
        delete: (key: string) => new Promise((res, rej) => {
          const transaction = db.transaction(['store'], 'readwrite');
          const store = transaction.objectStore('store');
          const req = store.delete(key);
          req.onsuccess = () => res(undefined);
          req.onerror = () => rej(req.error);
        }),
      });
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('store')) {
        db.createObjectStore('store');
      }
    };
  });
}
