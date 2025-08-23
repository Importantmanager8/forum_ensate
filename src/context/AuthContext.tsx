import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authService } from "../services/authService";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "student" | "committee" | "admin";
  status?: "ensa" | "external";
  assignedRoom?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  resendVerificationEmail: (email: any) => Promise<void>;
  verifyEmail: (token: any) => Promise<void>;
  logout: () => void;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; token: string } }
  | { type: "AUTH_FAILURE" }
  | { type: "LOGOUT" };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const profile = await authService.getProfile();
          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user: profile.data.user, token },
          });
        } catch (error) {
          localStorage.removeItem("token");
          dispatch({ type: "AUTH_FAILURE" });
        }
      } else {
        dispatch({ type: "AUTH_FAILURE" });
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: "AUTH_START" });
    try {
      const response = await authService.login(email, password);
      localStorage.setItem("token", response.data.token);
      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user: response.data.user, token: response.data.token },
      });
    } catch (error) {
      dispatch({ type: "AUTH_FAILURE" });
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      await authService.register(userData);
      // Do NOT set token or dispatch AUTH_SUCCESS
    } catch (error) {
      throw error;
    }
  };

  const resendVerificationEmail = async (email: any) => {
    try {
      await authService.resendVerificationEmail(email);
      // Do NOT set token or dispatch AUTH_SUCCESS
    } catch (error) {
      throw error;
    }
  };

  const verifyEmail = async (token: any) => {
    try {
      await authService.verifyEmail(token);
      // Do NOT set token or dispatch AUTH_SUCCESS
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Optionally handle error (e.g. logging out already)
    } finally {
      dispatch({ type: "LOGOUT" });
      localStorage.removeItem("token"); // In case you forgot
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        resendVerificationEmail,
        verifyEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
