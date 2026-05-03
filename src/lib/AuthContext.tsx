import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase'; // Import from our secure, central firebase.ts file

// This defines what data our authentication context will hold.
interface AuthContextType {
  user: User | null; // The Firebase user object if logged in, otherwise null.
  loading: boolean;    // True while we're still checking the login status, then false.
}

// Create the actual React Context with a default value.
const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// This is the main component we will use. It will wrap our whole app.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // This special hook runs once when the app starts.
  useEffect(() => {
    // onAuthStateChanged is the real-time listener for login/logout from Firebase.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // When Firebase tells us the user's status, we update our state.
      setUser(currentUser);
      setLoading(false); // We're done loading.
    });

    // This function runs when the component is removed, to prevent memory leaks.
    return () => unsubscribe();
  }, []); // The empty array means this effect only runs once.

  const value = { user, loading };

  return (
    <AuthContext.Provider value={value}>
      {/* We wait until the loading is false before showing the rest of the app. */}
      {/* This prevents pages from "flickering" between login/logout states. */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// This is a simple, custom hook that our pages will use.
// It's a shortcut so pages can just write `const { user } = useAuth();`
export const useAuth = () => {
  return useContext(AuthContext);
};