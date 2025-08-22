import { database, DATABASE_ID, HABBIT_COLLECTION_ID } from '@/lib/appwrite';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ID } from 'react-native-appwrite';
import { Button, HelperText, TextInput } from 'react-native-paper';

const FREQUENCY = [
    { value: "daily", label: "Daily", icon: "🌅", description: "Every day" },
    { value: "weekly", label: "Weekly", icon: "📅", description: "Once a week" },
    { value: "monthly", label: "Monthly", icon: "🗓️", description: "Once a month" }
];

const AddHabbitScreen = () => {
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [frequency, setFrequency] = React.useState("daily");
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const validateForm = () => {
        if (!title.trim()) {
            setError("Please enter a habit title");
            return false;
        }
        if (title.trim().length < 3) {
            setError("Title must be at least 3 characters long");
            return false;
        }
        setError("");
        return true;
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setFrequency("daily");
        setError("");
    };

    const handleAddHabit = async () => {
        if (!user || !validateForm()) {
            return;
        }

        setLoading(true);
        try {
           await database.createDocument(DATABASE_ID, HABBIT_COLLECTION_ID, ID.unique(), {
            user_id: user.$id,
            title: title.trim(),
            description: description.trim(),
            frequency,
            streak_count: 0,
            last_completed: null, // <-- Change this from new Date().toISOString() to null
            created_at: new Date().toISOString(),
        });

            // Reset form after successful creation
            resetForm();
            router.back(); // navigate back to habits list
        } catch (err) {
            console.error("Error creating habit:", err);
            setError(err?.message || "Something went wrong while adding habit.");
        } finally {
            setLoading(false);
        }
    };

    const FrequencySelector = () => (
        <View className="space-y-3">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
                How often?
            </Text>
            {FREQUENCY.map((freq) => (
                <TouchableOpacity
                    key={freq.value}
                    onPress={() => setFrequency(freq.value)}
                    className={`p-4 rounded-xl border-2 flex-row items-center ${
                        frequency === freq.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-white'
                    }`}
                >
                    <Text className="text-2xl mr-3">{freq.icon}</Text>
                    <View className="flex-1">
                        <Text className={`text-base font-medium ${
                            frequency === freq.value ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                            {freq.label}
                        </Text>
                        <Text className={`text-sm ${
                            frequency === freq.value ? 'text-blue-700' : 'text-gray-600'
                        }`}>
                            {freq.description}
                        </Text>
                    </View>
                    {frequency === freq.value && (
                        <View className="w-5 h-5 rounded-full bg-blue-500 items-center justify-center">
                            <Text className="text-white text-xs">✓</Text>
                        </View>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white border-b border-gray-200 pt-12 pb-4 px-6">
                <View className="flex-row items-center">
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="mr-4 p-2 rounded-full bg-gray-100"
                    >
                        <Text className="text-gray-700 text-lg">←</Text>
                    </TouchableOpacity>
                    <View>
                        <Text className="text-2xl font-bold text-gray-900">
                            Add New Habit
                        </Text>
                        <Text className="text-gray-600 mt-1">
                            Start building a better you
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-6 py-6 space-y-6">
                    {/* Form Card */}
                    <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                        {/* Title Input */}
                        <View>
                            <Text className="text-lg font-semibold text-gray-900 mb-3">
                                What habit do you want to build?
                            </Text>
                            <TextInput
                                label="Habit Title"
                                mode="outlined"
                                value={title}
                                onChangeText={(text) => {
                                    setTitle(text);
                                    if (error && text.trim().length >= 3) {
                                        setError("");
                                    }
                                }}
                                placeholder="e.g., Drink 8 glasses of water"
                                outlineColor="#e5e7eb"
                                activeOutlineColor="#3b82f6"
                                style={{ 
                                    backgroundColor: 'white',
                                    fontSize: 16 
                                }}
                            />
                        </View>

                        {/* Description Input */}
                        <View>
                            <Text className="text-lg font-semibold text-gray-900 mb-3">
                                Add some details (optional)
                            </Text>
                            <TextInput
                                label="Description"
                                mode="outlined"
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Why is this habit important to you?"
                                multiline
                                numberOfLines={3}
                                outlineColor="#e5e7eb"
                                activeOutlineColor="#3b82f6"
                                style={{ 
                                    backgroundColor: 'white',
                                    fontSize: 16 
                                }}
                            />
                        </View>

                        {/* Frequency Selection */}
                        <FrequencySelector />
                    </View>

                    {/* Error Message */}
                    {error && (
                        <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <HelperText type="error" visible={true} style={{ fontSize: 14 }}>
                                {error}
                            </HelperText>
                        </View>
                    )}

                    {/* Motivation Card */}
                    <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        <View className="flex-row items-center mb-2">
                            <Text className="text-2xl mr-2">💡</Text>
                            <Text className="text-lg font-semibold text-blue-900">
                                Pro Tip
                            </Text>
                        </View>
                        <Text className="text-blue-800 leading-5">
                            Start small! It's better to do something consistently for 5 minutes 
                            than to do it perfectly once in a while.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Button */}
            <View className="bg-white border-t border-gray-200 p-6">
                <Button
                    mode="contained"
                    onPress={handleAddHabit}
                    loading={loading}
                    disabled={loading || !title.trim()}
                    buttonColor="#3b82f6"
                    style={{
                        paddingVertical: 6,
                        borderRadius: 12,
                    }}
                    contentStyle={{
                        paddingVertical: 12,
                    }}
                    labelStyle={{
                        fontSize: 16,
                        fontWeight: '600',
                    }}
                >
                    {loading ? 'Creating Habit...' : 'Create Habit'}
                </Button>
                
                {/* Cancel Button */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-3 p-3 items-center"
                >
                    <Text className="text-gray-600 font-medium">
                        Cancel
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default AddHabbitScreen;