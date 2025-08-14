import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";

function RouteGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const isAuth = false;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isAuth) {
            router.replace("/auth");
        }
    }, [mounted, isAuth]);

    return <>{children}</>;
}

export default function RootLayout() {
    return (
        <RouteGuard>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </RouteGuard>
    );
}
