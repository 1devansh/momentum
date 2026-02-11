/**
 * Main App Layout (Tab Navigation)
 *
 * The main navigation structure for authenticated users.
 * Uses bottom tab navigation for primary screens.
 */

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { COLORS } from "../../src/config";
import { FEATURE_FLAGS } from "../../src/config/env";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.surface,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sunny-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      {FEATURE_FLAGS.enableDebugScreen && (
        <Tabs.Screen
          name="debug"
          options={{
            title: "Debug",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bug-outline" size={size} color={color} />
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
