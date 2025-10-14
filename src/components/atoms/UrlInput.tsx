import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

export default function UrlInput({ value, onChangeText }: Props) {
  return (
    <View style={styles.wrapper}>
      <Ionicons
        name="globe-outline"
        size={20}
        color="#00bf8f"
        style={styles.icon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="https://example.com"
        placeholderTextColor="#666"
        autoCapitalize="none"
        keyboardType="url"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#181818",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#00bf8f",
    paddingHorizontal: 12,
    paddingVertical: 14,
    width: "100%",
    maxWidth: 420,
    marginVertical: 10,
  },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
