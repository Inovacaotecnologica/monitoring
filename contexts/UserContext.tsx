import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * User context holds information about the currently authenticated user and
 * the companies they are allowed to access. It also exposes helper
 * functions to update the user, change the selected company, and log out.
 *
 * The state is persisted in localStorage under the key `userData` so that
 * refreshing the page does not log the user out. When the provider
 * initialises it will read from localStorage if present.
 */

export interface User {
  token: string;
  email: string;
  /**
   * List of company names the user may access. These names should
   * correspond to sheet tabs or other identifiers in your backend.
   */
  companies: string[];
  /**
   * Currently selected company. Determines which devices are shown.
   */
  selectedCompany: string | null;
  /**
   * Optional limit on how many companies (tabs) the user may access. If not
   * provided, all companies in the `companies` array will be available.
   */
  maxCompanies?: number;
  /**
   * Optional limit on how many devices the user may create. If not
   * provided, there is no limit.
   */
  maxDevices?: number;
}

interface UserContextType {
  user: User | null;
  /**
   * Sets the user object and persists it to localStorage. Should be
   * called after successful login.
   */
  setUser: (user: User) => void;
  /**
   * Update the currently selected company. Persists the change to
   * localStorage.
   */
  setSelectedCompany: (company: string) => void;
  /**
   * Clears user state and removes persistence. Useful on logout.
   */
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);

  // On mount, load user from localStorage if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('userData');
        if (raw) {
          const parsed = JSON.parse(raw) as User;
          setUserState(parsed);
        }
      } catch (e) {
        console.error('Failed to parse user data from storage', e);
      }
    }
  }, []);

  const setUser = (newUser: User) => {
    setUserState(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userData', JSON.stringify(newUser));
      // Also persist auth token separately for legacy code if needed
      localStorage.setItem('authToken', newUser.token);
    }
  };

  const setSelectedCompany = (company: string) => {
    setUserState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, selectedCompany: company };
      if (typeof window !== 'undefined') {
        localStorage.setItem('userData', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const logout = () => {
    setUserState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, setSelectedCompany, logout }}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * Hook to access the user context. Throws if used outside of a provider.
 */
export const useUser = (): UserContextType => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
};