import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

export default function DataBreachSecurity() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [breaches, setBreaches] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter an email or username");
      return;
    }

    setError("");
    setLoading(true);
    setBreaches([]);

    try {
      // Normally you'd call your backend proxy (to avoid direct HIBP API key exposure)
      // Example: const response = await fetch(`https://your-backend.com/api/breaches/${query}`);
      // For demo UI purposes, we’ll simulate a response:
      setTimeout(() => {
        setBreaches([
          {
            Name: "LinkedIn",
            Domain: "linkedin.com",
            BreachDate: "2012-05-05",
            Description:
              "Email addresses and passwords were exposed in a LinkedIn data breach affecting millions of accounts.",
          },
          {
            Name: "Adobe",
            Domain: "adobe.com",
            BreachDate: "2013-10-04",
            Description:
              "Customer data including email addresses and encrypted passwords were compromised in this breach.",
          },
        ]);
        setLoading(false);
      }, 1800);
    } catch (err) {
      setError("Unable to fetch breach data. Please try again.");
      setLoading(false);
    }
  };

  const renderBreach = ({ item }) => (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={styles.cardWrapper}
    >
      <LinearGradient colors={["#00bf8f", "#002b2b"]} style={styles.card}>
        <Text style={styles.breachName}>{item.Name}</Text>
        <Text style={styles.breachDomain}>{item.Domain}</Text>
        <Text style={styles.breachDate}>🗓 {item.BreachDate}</Text>
        <Text style={styles.breachDescription}>{item.Description}</Text>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, width: "100%" }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Data Breach Security</Text>
          <Text style={styles.subtitle}>
            Check if your account has been exposed in a known breach
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#00bf8f"
            style={styles.icon}
          />
          <TextInput
            placeholder="Enter email or username"
            placeholderTextColor="#666"
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={handleSearch}
        >
          <LinearGradient
            colors={["#00bf8f", "#007f5f"]}
            style={styles.buttonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Scan for Breaches</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.resultsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#00bf8f" />
          ) : breaches.length === 0 ? (
            <Text style={styles.noDataText}>
              No results yet. Try searching your email.
            </Text>
          ) : (
            <FlatList
              data={breaches}
              keyExtractor={(item) => item.Name}
              renderItem={renderBreach}
              contentContainerStyle={{ paddingBottom: 80 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
  },
  title: {
    color: "#00bf8f",
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#00bf8f33",
  },
  icon: { marginRight: 6 },
  input: {
    flex: 1,
    color: "#fff",
    height: 48,
    fontSize: 16,
  },
  button: {
    alignSelf: "center",
    marginVertical: 10,
    width: "90%",
  },
  buttonGradient: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  error: {
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 6,
  },
  resultsContainer: {
    flex: 1,
    width: "100%",
    marginTop: 10,
  },
  cardWrapper: {
    marginHorizontal: 20,
    marginBottom: 14,
  },
  card: {
    borderRadius: 14,
    padding: 16,
  },
  breachName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  breachDomain: {
    color: "#b0b0b0",
    fontSize: 14,
    marginBottom: 4,
  },
  breachDate: {
    color: "#80ffcc",
    fontSize: 13,
    marginBottom: 6,
  },
  breachDescription: {
    color: "#ddd",
    fontSize: 13,
    lineHeight: 18,
  },
  noDataText: {
    color: "#888",
    textAlign: "center",
    marginTop: 30,
    fontSize: 15,
  },
});
