import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

const cache = {};

export const useFetchCollection = (collectionName) => {
  const [data, setData] = useState(cache[collectionName] || []);
  const [loading, setLoading] = useState(!cache[collectionName]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cache[collectionName]) {
      setData(cache[collectionName]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getDocs(collection(db, collectionName))
      .then((snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        cache[collectionName] = items;
        setData(items);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [collectionName]);

  return { data, loading, error };
};
