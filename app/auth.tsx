import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { KeyboardAvoidingView, Platform, View } from 'react-native'
import { Button, Text, TextInput } from "react-native-paper"

export default function Auth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    // const [isLoading, setIsLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState("")
    const { signIn, signUp } = useAuth();
    const router = useRouter();


    const handleSwitchMode = () => {
        setIsSignUp(!isSignUp)
    }

    const handleAuth = async () => {
        // setIsLoading(true)
        if (email.slice(email.length - 9, email.length) !== "@gmail.com") {
            setError("Must be an email")
        }
        if (password.length < 6) {
            setError("Password must be greater than 6 char.")
        }
        setError("")
        if (isSignUp) {
            const error = await signUp(email, password);
            if (error) {
                setError(error)
                return
            }
        } else {
            const error = await signIn(email, password);
            if (error) {
                setError(error)
                return
            }
            router.replace('/')
        }

        // setIsLoading(false)
    }



    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View className="flex-1 justify-center items-center p-5">
                <View className="flex flex-col gap-5 w-full ">
                    <Text className="text-center mt-4 text-3xl font-bold self-center">
                        {isSignUp ? "Create account" : "Welcome Back"}
                    </Text>

                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize='none'
                        keyboardType='email-address'
                        placeholder='example@gmail.com'
                        mode='outlined'
                        className="mb-2"
                    />

                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        autoCapitalize='none'
                        secureTextEntry={true}
                        mode='outlined'
                        className="mb-2"
                    />

                    {error && <Text style={{ color: 'red' }}>{error}</Text>}

                    <Button
                        mode='contained'
                        onPress={handleAuth}
                        // loading={isLoading}
                        disabled={!email || !password}
                        className="mt-2"
                    >
                        {isSignUp ? "Sign Up" : "Sign In"}
                    </Button>

                    <Button
                        mode='text'
                        onPress={handleSwitchMode}
                        className="mt-1"
                    >
                        {isSignUp ? "Already have an account? Sign In" : "Dont have account? Sign Up"}
                    </Button>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}