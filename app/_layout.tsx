import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

function RouteGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, isloadingUser } = useAuth();
    const segmants = useSegments()



    useEffect(() => {
        const inAuthGroup = segmants[0] === "auth";
        if (!inAuthGroup && !user && !isloadingUser) {
            router.replace("/auth");
        } else if (user && inAuthGroup && !isloadingUser) {
            router.replace("/");
        }
    }, [segmants, user]);

    return <>{children}</>;
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <RouteGuard>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
            </RouteGuard>
        </AuthProvider>
    );
}
