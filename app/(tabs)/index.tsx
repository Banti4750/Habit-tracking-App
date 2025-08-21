import { useAuth } from "@/lib/auth-context";
import { Text, View, } from "react-native";
import { Button } from "react-native-paper";
import './../../global.css';
export default function Index() {
  const { signOut, user } = useAuth();
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>
      {user && (<>
        <Button style={{ backgroundColor: 'red' }} mode="text" onPress={signOut} icon={"logout"}>Logout</Button>
      </>)}
    </View>
  );
}
