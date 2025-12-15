import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } 
from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Utilise localStorage comme moteur de stockage

// Importez vos slices
import userSlice from './userSlice';


// Configuration de persistance
const persistConfig = {
  key: 'root',
  storage: storage,
};

// Appliquer persistReducer pour chaque slice
const persistedUserReducer = persistReducer(persistConfig, userSlice);
export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
  
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Vous pouvez désactiver cette vérification uniquement pour redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
