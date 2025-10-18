import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { API_URL } from "@/src/constants/api";
import COLORS from "@/src/constants/colors";

export default function AISecurityAgent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");

  type ChatMessage = {
    sender: "user" | "ai";
    text: string;
  };
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // === RUN SECURITY SCAN ===
  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setChatOpen(false);
    setChatHistory([]);

    try {
      const { data } = await axios.get(`${API_URL}/ai/`);
      setResult(data);
    } catch (err) {
      setError("Failed to analyze system. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // === SEND CHAT MESSAGE ===
  const handleChatSend = async () => {
    if (!chatInput.trim() || !result) return;

    const userMessage = chatInput.trim();
    setChatHistory((prev) => [...prev, { sender: "user", text: userMessage }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/ai/chat`, {
        analysisData: result,
        message: userMessage,
      });
      setChatHistory((prev) => [
        ...prev,
        { sender: "ai", text: data.reply || "No response." },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { sender: "ai", text: "⚠️ Could not get a response." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "black" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <Animated.View entering={FadeInUp.duration(600)}>
            <Text style={styles.title}>Bot-X Security Agent</Text>
            <Text style={styles.subtitle}>
              Analyze your system and get insights from an AI security expert.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600)}>
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.6 }]}
              onPress={handleAnalyze}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color="#fff"
              />
              <Text style={styles.buttonText}>
                {loading ? "Analyzing..." : "Run Security Scan"}
              </Text>
            </TouchableOpacity>

            {loading && (
              <ActivityIndicator
                color={COLORS.primary}
                style={{ marginTop: 16 }}
              />
            )}
          </Animated.View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* === ANALYSIS RESULTS === */}
          {result && (
            <Animated.View
              entering={FadeInUp.duration(700)}
              style={styles.card}
            >
              <Text style={styles.sectionTitle}>🔍 Analysis Summary</Text>
              <Text style={styles.score}>AI Score: {result.aiScore}/100</Text>
              <Text style={styles.level}>
                Status:{" "}
                <Text
                  style={{
                    color:
                      result.vulnerabilityLevel === "Safe"
                        ? "#00FFA3"
                        : result.vulnerabilityLevel === "Vulnerable"
                        ? "#FFB020"
                        : "#FF4C4C",
                    fontWeight: "700",
                  }}
                >
                  {result.vulnerabilityLevel}
                </Text>
              </Text>
              <Text style={styles.summary}>{result.summary}</Text>

              <Text style={styles.sectionSubtitle}>🛠 Recommendations</Text>
              {result.recommendations.map((rec, i) => (
                <View key={i} style={styles.recBox}>
                  <Text style={styles.recTitle}>{rec.title}</Text>
                  <Text style={styles.recDetails}>{rec.details}</Text>
                </View>
              ))}

              <Text style={styles.sectionSubtitle}>
                🌐 Latest Security News
              </Text>
              {result.securityNews.map((news, i) => (
                <Animated.View
                  key={i}
                  entering={FadeInUp.delay(i * 150).duration(500)}
                  style={styles.newsBox}
                >
                  <Text style={styles.newsHeadline}>• {news.headline}</Text>
                  <Text style={styles.newsSource}>Source: {news.source}</Text>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {/* === CHAT SECTION === */}
          {result && !chatOpen && (
            <Animated.View entering={FadeInUp.duration(500)}>
              <TouchableOpacity
                style={styles.chatToggle}
                onPress={() => setChatOpen(true)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.chatToggleText}>
                  Ask the AI about your results
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {chatOpen && (
            <Animated.View
              entering={FadeInUp.duration(600)}
              style={styles.chatSection}
            >
              <Text style={styles.sectionTitle}>💬 AI Chat Assistant</Text>

              <ScrollView
                style={styles.chatHistory}
                showsVerticalScrollIndicator={false}
              >
                {chatHistory.map((msg, idx) => (
                  <Animated.View
                    key={idx}
                    entering={FadeInUp.delay(idx * 100).duration(400)}
                    style={[
                      styles.chatBubble,
                      msg.sender === "user"
                        ? styles.userBubble
                        : styles.aiBubble,
                    ]}
                  >
                    <Text style={styles.chatText}>{msg.text}</Text>
                  </Animated.View>
                ))}
              </ScrollView>

              {chatLoading && (
                <ActivityIndicator
                  color={COLORS.primary}
                  style={{ marginVertical: 8 }}
                />
              )}

              <View style={styles.chatInputContainer}>
                <TextInput
                  style={styles.chatInput}
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder="Ask about your system security..."
                  placeholderTextColor="#888"
                  multiline
                />
                <TouchableOpacity
                  onPress={handleChatSend}
                  disabled={chatLoading}
                >
                  <Ionicons name="send" size={22} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  title: {
    color: COLORS.primary,
    fontSize: 26,
    fontWeight: "bold",
    margin: 16,
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    marginBottom: 18,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginTop: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    lineHeight: 22,
  },
  sectionSubtitle: {
    lineHeight: 22,
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
  },
  score: {
    lineHeight: 22,
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: "600",
  },
  level: {
    lineHeight: 22,
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  summary: {
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginBottom: 10,
  },
  recBox: {
    marginBottom: 6,
    paddingLeft: 4,
  },
  recTitle: {
    lineHeight: 24,
    color: COLORS.textDark,
    fontWeight: "600",
  },
  recDetails: {
    lineHeight: 22,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  newsBox: {
    margin: 16,
    borderLeftColor: COLORS.primary,
    borderLeftWidth: 2,
    paddingLeft: 6,
  },
  newsHeadline: {
    lineHeight: 24,
    color: COLORS.textDark,
    fontSize: 14,
  },
  newsSource: {
    lineHeight: 24,
    color: COLORS.textPrimary,
    fontSize: 12,
    fontStyle: "italic",
  },
  chatToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#121212",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  chatToggleText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  chatSection: {
    marginTop: 16,
    backgroundColor: "#161616",
    borderRadius: 14,
    padding: 14,
  },
  chatHistory: {
    maxHeight: 250,
  },
  chatBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
    maxWidth: "80%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary + "33",
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#222",
  },
  chatText: {
    color: "#fff",
    fontSize: 13,
    lineHeight: 18,
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    color: "#fff",
    fontSize: 13,
    maxHeight: 80,
  },
});
