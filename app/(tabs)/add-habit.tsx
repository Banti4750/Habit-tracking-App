import { database, DATABASE_ID, HABBIT_COLLECTION_ID } from '@/lib/appwrite';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { ID } from 'react-native-appwrite';
import { Button, HelperText, SegmentedButtons, TextInput } from 'react-native-paper';

const FREQUENCY = ["daily", "weekly", "monthly"]

const AddHabbitScreen = () => {
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [frequency, setFrequency] = React.useState("daily");
    const [error, setError] = React.useState("")
    const [loading, setLoading] = React.useState(false);
    const { user } = useAuth()
    const router = useRouter();

    const handleAddHabit = async () => {
        if (!user) {
            return;
        }

        try {
            await database.createDocument(DATABASE_ID, HABBIT_COLLECTION_ID, ID.unique(), {
                user_id: user.$id,
                title,
                description,
                frequency,
                streak_count: 0,
                last_completed: new Date().toISOString(),
                created_at: new Date().toISOString(),
            })

            router.back(); // navigate back to habits list
        } catch (err) {
            console.error("Error creating habit:", err);
            setError(err?.message || "Something went wrong while adding habit.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <View className="flex-1 justify-center items-center p-4 bg-white">
                <View className="w-full max-w-md gap-2">
                    <TextInput
                        label="Title"
                        mode="outlined"
                        value={title}
                        onChangeText={setTitle}
                        style={{ marginBottom: 16 }}
                    />

                    <TextInput
                        label="Description"
                        mode="outlined"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        style={{ marginBottom: 16 }}
                    />
                    <View>
                        <SegmentedButtons value={frequency} onValueChange={(value) => setFrequency(value)} buttons={FREQUENCY.map((freq) => ({
                            value: freq,
                            label: freq.charAt(0).toUpperCase() + freq.slice(1)

                        }))} />
                    </View>
                    {error ? (
                        <HelperText type="error" visible={true}>
                            {error}
                        </HelperText>
                    ) : null}

                    <Button
                        mode="contained"
                        onPress={handleAddHabit}
                        buttonColor="#10B981" // emerald-500
                        loading={loading}
                        disabled={loading}
                    >
                        Add Habit
                    </Button>
                </View>
            </View>

        </>
    )
}

export default AddHabbitScreen