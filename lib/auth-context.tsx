import { account } from "@/lib/appwrite";
import { createContext, useContext, useEffect, useState } from "react";
import { ID, Models } from "react-native-appwrite";

type AuthContextType = {
    user: Models.User<Models.Preferences> | null;
    isloadingUser: boolean;
    signUp: (email: string, password: string) => Promise<string | null>;
    signIn: (email: string, password: string) => Promise<string | null>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [isloadingUser, setIsloadingUser] = useState<boolean>(true);

    useEffect(() => {
        getUser()
    }, [])

    const getUser = async () => {
        try {
            const session = await account.get();
            setUser(session);
        } catch (error) {
            setUser(null);
        } finally {
            setIsloadingUser(false);
        }
    }

    async function signUp(email: string, password: string) {
        try {
            await account.create(ID.unique(), email, password);
            await signIn(email, password);
            return null;
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            } else {
                return "An error occured during signup"
            }
        }
    }
    async function signIn(email: string, password: string) {
        try {
            await account.createEmailPasswordSession(email, password);
            const session = await account.get();
            setUser(session);
            return null;
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            } else {
                return "An error occured during signIn"
            }
        }
    }

    async function signOut() {
        try {
            await account.deleteSession("current");
            setUser(null);
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <AuthContext.Provider value={{ user, isloadingUser, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be inside of the Authcontext")
    }

    return context;
}