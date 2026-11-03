
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import authService from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    console.log("User from localStorage:", localStorage.getItem("user"));
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || null;
        } catch {
            return null;
        }
    });

    const [loading, setLoading] = useState(true);

    // Verify session whenever application loads
    useEffect(() => {
        const verifySession = async () => {
            try {
                // Backend reads refresh token from HTTP-only cookie
                const response = await authService.refresh();

                const profile =
                    response.data;

                if (profile) {
                    setUser(profile);
                    localStorage.setItem(
                        "user",
                        JSON.stringify(profile)
                    );
                }
            } catch (error) {
                console.log("Session verification failed:", error);

                setUser(null);
                localStorage.removeItem("user");
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, []);

    // Login
    const login = async (credentials) => {
        const response = await authService.login(credentials);

        const loggedInUser =
            response.data?.user ||
            response.data?.admin ||
            response.data;

        if (!loggedInUser) {
            throw new Error("Login response did not contain user details");
        }

        // No access token stored in localStorage.
        // Backend sets HTTP-only cookies.

        localStorage.setItem(
            "user",
            JSON.stringify(loggedInUser)
        );

        setUser(loggedInUser);

        return loggedInUser;
    };

    // Logout
    const logout = async () => {
        try {
            await authService.logout();
        } finally {
            setUser(null);
            localStorage.removeItem("user");
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: Boolean(user),
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
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}
