import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
  } from 'react';
  import { api, authStorage, type User } from './api';
  
  type UserContextValue = {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
  };
  
  const UserContext = createContext<UserContextValue | null>(null);
  
  export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<User | null>(() => authStorage.getUser());
    const [isLoading, setIsLoading] = useState<boolean>(true);
  
    useEffect(() => {
      const token = authStorage.getToken();
  
      if (!token) {
        setIsLoading(false);
        return;
      }
  
      api
        .me()
        .then((me) => {
          setUserState(me);
          authStorage.setUser(me);
        })
        .catch(() => {
          authStorage.clear();
          setUserState(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, []);
  
    const setUser = (u: User | null) => {
      setUserState(u);
      if (u) {
        authStorage.setUser(u);
      } else {
        authStorage.clear();
      }
    };
  
    const logout = () => {
      authStorage.clear();
      setUserState(null);
    };
  
    return (
      <UserContext.Provider value={{ user, isLoading, setUser, logout }}>
        {children}
      </UserContext.Provider>
    );
  }
  
  export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used inside UserProvider');
    return ctx;
  }