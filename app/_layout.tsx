import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="fork.knife" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: "Planner",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: "Shopping",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="cart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="fridge"
        options={{
          title: "Fridge",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="refrigerator" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-links"
        options={{
          title: "Links",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="link" color={color} />,
        }}
      />
      {/* Hide non-tab routes from tab bar */}
      <Tabs.Screen name="[id]" options={{ href: null }} />
      <Tabs.Screen name="add-link" options={{ href: null }} />
      <Tabs.Screen name="my-links" options={{ href: null }} />
      <Tabs.Screen name="onboarding" options={{ href: null }} />
      <Tabs.Screen name="premium" options={{ href: null }} />
    </Tabs>
  );
}
