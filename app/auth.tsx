import React, { useState } from 'react'
import { KeyboardAvoidingView, Platform, View } from 'react-native'
import { Button, Text, TextInput } from "react-native-paper"

export default function Auth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSignUp = async () => {
        setIsLoading(true)
        // Add your authentication logic here
        console.log('Sign up with:', { email, password })
        setIsLoading(false)
    }

    const handleSignIn = () => {
        // Navigate to sign in screen or toggle mode
        console.log('Navigate to sign in')
    }

    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View className="flex-1 justify-center items-center px-5">
                <View className="flex flex-col gap-5 w-full max-w-sm">
                    <Text className="text-center mt-4 text-3xl font-bold">
                        Create account
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

                    <Button
                        mode='contained'
                        onPress={handleSignUp}
                        loading={isLoading}
                        disabled={!email || !password || isLoading}
                        className="mt-2"
                    >
                        Sign up
                    </Button>

                    <Button
                        mode='text'
                        onPress={handleSignIn}
                        className="mt-1"
                    >
                        Already have an account? Sign In
                    </Button>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}