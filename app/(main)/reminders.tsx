/**
 * Daily Reminders Screen
 *
 * Allows users to manage multiple daily reminders.
 */

import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Href, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, ScreenContainer } from "../../src/components";
import { COLORS } from "../../src/config";
import { useBackToTab } from "../../src/hooks";
import { useUser } from "../../src/state";

export default function RemindersScreen() {
  const { preferences, addReminder, removeReminder, toggleReminder } =
    useUser();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [, setSelectedTime] = useState(new Date());

  const navigateToSettings = useBackToTab("/(main)/settings" as Href);

  const handleAddReminder = () => {
    if (Platform.OS === "android") {
      setShowTimePicker(true);
    } else {
      // iOS: Show inline picker
      setShowTimePicker(true);
    }
  };

  const handleTimeSelected = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (date && event.type !== "dismissed") {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const timeString = `${hours}:${minutes}`;
      addReminder(timeString);
      setSelectedTime(date);

      if (Platform.OS === "ios") {
        setShowTimePicker(false);
      }
    }
  };

  const handleDeleteReminder = (id: string) => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeReminder(id),
        },
      ],
    );
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <ScreenContainer>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push("/(main)/settings" as Href)}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Daily Reminders</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Description */}
        <View style={styles.descriptionBox}>
          <Text style={styles.description}>
            Set multiple daily reminders to help you stay on track with your
            goals. You&apos;ll receive a notification at each scheduled time.
          </Text>
        </View>

        {/* Reminders List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Reminders</Text>
          {preferences.dailyReminders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color={COLORS.textSecondary}
              />
              <Text style={styles.emptyText}>No reminders set</Text>
              <Text style={styles.emptySubtext}>
                Add your first reminder to get started
              </Text>
            </View>
          ) : (
            preferences.dailyReminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminderItem}>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderTime}>
                    {formatTime(reminder.time)}
                  </Text>
                  <Text style={styles.reminderStatus}>
                    {reminder.enabled ? "Active" : "Paused"}
                  </Text>
                </View>
                <View style={styles.reminderActions}>
                  <Switch
                    value={reminder.enabled}
                    onValueChange={() => toggleReminder(reminder.id)}
                    trackColor={{
                      false: COLORS.surface,
                      true: COLORS.primary,
                    }}
                    thumbColor={COLORS.background}
                  />
                  <TouchableOpacity
                    onPress={() => handleDeleteReminder(reminder.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={COLORS.error}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Add Reminder Button */}
        <View style={styles.addButtonContainer}>
          <Button
            title="Add Reminder"
            onPress={handleAddReminder}
            icon={<Ionicons name="add" size={20} color="#FFFFFF" />}
          />
        </View>

        {/* Time Picker */}
        {showTimePicker && (
          <View style={styles.pickerContainer}>
            {Platform.OS === "ios" && (
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.pickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.pickerTitle}>Select Time</Text>
                <TouchableOpacity
                  onPress={() =>
                    handleTimeSelected({ type: "set" }, new Date())
                  }
                >
                  <Text style={styles.pickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour={false}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleTimeSelected}
            />
          </View>
        )}

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.infoText}>
            Make sure notifications are enabled in your device settings to
            receive reminders.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  descriptionBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  reminderItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTime: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  reminderStatus: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  reminderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  deleteButton: {
    padding: 8,
  },
  addButtonContainer: {
    marginBottom: 24,
  },
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  pickerCancel: {
    fontSize: 16,
    color: COLORS.error,
  },
  pickerDone: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
