
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import authService from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || null;
        } catch {
            return null;
        }
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await authService.getProfile();
                const profile = response.data?.user || response.data;

                if (profile) {
                    setUser(profile);
                    localStorage.setItem("user", JSON.stringify(profile));
                }
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, []);

    const login = async (credentials) => {
        const response = await authService.login(credentials);
        console.log("res :", response.data)
        // Adapt these two fields if your login response uses another shape.
        const token =
            response.data?.accessToken ||
            response.data?.token ||
            response.accessToken ||
            response.token;

        const loggedInUser =
            response.data ||
            response.user;

        if (!token) {
            throw new Error("Login response did not contain an access token");
        }

        if (!loggedInUser) {
            throw new Error("Login response did not contain user details");
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);

        return loggedInUser;
    };

    const logout = async () => {
        try {
            await authService.logout();
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: Boolean(user && localStorage.getItem("token")),
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
