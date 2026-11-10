import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
    getCurrentUser,
    login as loginApi,
    logout as logoutApi,
    type LoginRequest,
    type UserResponse,
} from "../api/auth";

interface AuthContextType {
    user: UserResponse | null;
    loading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);

    async function refreshUser() {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch {
            setUser(null);
        }
    }

    useEffect(() => {
        refreshUser().finally(() => setLoading(false));
    }, []);

    async function login(data: LoginRequest) {
        await loginApi(data);
        await refreshUser();
    }

    async function logout() {
        await logoutApi();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth mora biti korišten unutar AuthProvider-a");
    }
    return context;
}
