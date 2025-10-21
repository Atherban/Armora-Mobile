import React, { useState, useRef, useEffect } from "react";
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
  Dimensions,
  Alert,
  Share,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { API_URL } from "@/src/constants/api";
import COLORS from "@/src/constants/colors";

const { width } = Dimensions.get("window");

// Constants
const SECURITY_CONFIG = {
  Safe: {
    color: "#00ffcc",
    icon: "shield-checkmark",
    gradient: ["#00ffcc", "#00b38f"],
  },
  Vulnerable: {
    color: "#FFD700",
    icon: "warning",
    gradient: ["#FFD700", "#ffaa00"],
  },
  Critical: {
    color: "#ff4d4d",
    icon: "alert-circle",
    gradient: ["#ff4d4d", "#cc0000"],
  },
};

const QUICK_QUESTIONS = [
  "What's the most critical issue?",
  "How can I improve my score?",
  "Explain the network threats",
  "What do these recommendations mean?",
];

// Components
const HeaderSection = ({ onAnalyze, loading }) => (
  <Animated.View entering={FadeInDown.duration(800)}>
    <LinearGradient
      colors={["#00bf8f", "#007a5c", "#001510"]}
      style={styles.headerCard}
    >
      <View style={styles.headerIconContainer}>
        <Ionicons name="shield-checkmark" size={42} color="#fff" />
        <View style={styles.scanBadge}>
          <Text style={styles.scanBadgeText}>AI</Text>
        </View>
      </View>
      <Text style={styles.title}>AI Security Agent</Text>
      <Text style={styles.subtitle}>
        Advanced security analysis and intelligent threat detection powered by
        AI
      </Text>
    </LinearGradient>
  </Animated.View>
);

const AnalyzeButton = ({ loading, onPress }) => (
  <Animated.View entering={FadeInDown.duration(600).delay(200)}>
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={[styles.scanButton, loading && styles.scanButtonDisabled]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={loading ? ["#666", "#444"] : ["#00bf8f", "#007a5c"]}
        style={styles.scanButtonGradient}
      >
        {loading ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.scanButtonText}>Analyzing Security...</Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons name="scan-outline" size={22} color="#fff" />
            <Text style={styles.scanButtonText}>Run Security Analysis</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
);

const SecurityScoreCard = ({ result }) => {
  const config =
    SECURITY_CONFIG[result.vulnerabilityLevel] || SECURITY_CONFIG.Vulnerable;

  return (
    <Animated.View entering={FadeInDown.duration(700)} style={styles.scoreCard}>
      <View style={styles.scoreHeader}>
        <Ionicons name={config.icon} size={24} color={config.color} />
        <Text style={styles.scoreTitle}>Security Score</Text>
      </View>

      <View style={styles.scoreMain}>
        <Text style={styles.scoreValue}>{result.aiScore}</Text>
        <Text style={styles.scoreTotal}>/100</Text>
      </View>

      <View style={styles.confidenceContainer}>
        <View style={styles.confidenceHeader}>
          <Text style={styles.confidenceLabel}>Confidence Level</Text>
          <Text style={styles.confidencePercent}>{result.aiScore}%</Text>
        </View>
        <View style={styles.meterContainer}>
          <LinearGradient
            colors={["#ff4d4d", "#FFD700", COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.meterFill, { width: `${result.aiScore}%` }]}
          />
        </View>
      </View>

      <View
        style={[styles.statusBadge, { backgroundColor: `${config.color}20` }]}
      >
        <Text style={[styles.statusText, { color: config.color }]}>
          {result.vulnerabilityLevel} Security
        </Text>
      </View>
    </Animated.View>
  );
};

const PriorityFixesSection = ({ fixes, onFixPress }) => {
  if (!fixes?.length) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(800)}
      style={styles.prioritySection}
    >
      <View style={styles.sectionHeader}>
        <Ionicons name="warning" size={20} color="#ff4d4d" />
        <Text style={styles.sectionTitle}>Priority Fixes</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.fixesScroll}
      >
        {fixes.map((fix) => (
          <View key={fix.id} style={styles.fixCard}>
            <View style={styles.fixHeader}>
              <Ionicons name={fix.icon} size={20} color="#ff4d4d" />
              <View
                style={[styles.priorityBadge, { backgroundColor: "#ff4d4d" }]}
              >
                <Text style={styles.priorityBadgeText}>PRIORITY</Text>
              </View>
            </View>
            <Text style={styles.fixTitle}>{fix.title}</Text>
            <Text style={styles.fixDescription}>{fix.description}</Text>
            <TouchableOpacity
              style={styles.fixButton}
              onPress={() => onFixPress(fix)}
            >
              <Text style={styles.fixButtonText}>Fix Now</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const ThreatBreakdownSection = ({ threats }) => (
  <Animated.View
    entering={FadeInDown.duration(800)}
    style={styles.threatSection}
  >
    <View style={styles.sectionHeader}>
      <Ionicons name="analytics" size={20} color={COLORS.primary} />
      <Text style={styles.sectionTitle}>Threat Analysis</Text>
    </View>

    <View style={styles.threatsGrid}>
      {threats?.map((threat, index) => (
        <View key={index} style={styles.threatItem}>
          <View style={styles.threatInfo}>
            <Ionicons name={threat.icon} size={18} color="#888" />
            <Text style={styles.threatCategory}>{threat.category}</Text>
          </View>
          <View style={styles.threatDetails}>
            <View
              style={[
                styles.threatLevel,
                { backgroundColor: `${getThreatColor(threat.level)}20` },
              ]}
            >
              <Text
                style={[
                  styles.threatLevelText,
                  { color: getThreatColor(threat.level) },
                ]}
              >
                {threat.level}
              </Text>
            </View>
            <Text style={styles.threatScore}>{threat.score}%</Text>
          </View>
        </View>
      ))}
    </View>
  </Animated.View>
);

const RecommendationsSection = ({ recommendations, onExport }) => (
  <Animated.View
    entering={FadeInDown.duration(800)}
    style={styles.recommendationsCard}
  >
    <View style={styles.sectionHeader}>
      <Ionicons name="bulb-outline" size={20} color="#FFD700" />
      <Text style={styles.sectionTitle}>Security Recommendations</Text>
    </View>

    <ScrollView
      style={styles.recommendationsList}
      showsVerticalScrollIndicator={false}
    >
      {recommendations?.map((rec, index) => (
        <View key={index} style={styles.recommendationItem}>
          <View style={styles.recommendationHeader}>
            <Text style={styles.recommendationTitle}>{rec.title}</Text>
            <View
              style={[styles.priorityBadge, { backgroundColor: "#FFD700" }]}
            >
              <Text style={styles.priorityBadgeText}>ACTION</Text>
            </View>
          </View>
          <Text style={styles.recommendationDetails}>{rec.details}</Text>
        </View>
      ))}
    </ScrollView>

    <TouchableOpacity style={styles.exportButton} onPress={onExport}>
      <LinearGradient
        colors={["#00bf8f", "#007a5c"]}
        style={styles.exportButtonGradient}
      >
        <Ionicons name="document-text-outline" size={20} color="#fff" />
        <Text style={styles.exportButtonText}>Export Security Report</Text>
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
);

const AIChatSection = ({
  chatHistory,
  chatInput,
  setChatInput,
  onSend,
  chatLoading,
  onQuickQuestion,
  chatScrollRef,
}) => (
  <Animated.View entering={FadeInUp.duration(600)} style={styles.chatSection}>
    <View style={styles.chatHeader}>
      <View style={styles.chatHeaderInfo}>
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={20} color="#000" />
        </View>
        <View>
          <Text style={styles.chatTitle}>AI Security Assistant</Text>
          <Text style={styles.chatStatus}>Ready to help</Text>
        </View>
      </View>
    </View>

    <ScrollView
      style={styles.chatMessages}
      showsVerticalScrollIndicator={false}
      ref={chatScrollRef as React.RefObject<ScrollView>}
    >
      {chatHistory.length === 0 && (
        <View style={styles.welcomeMessage}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={48}
            color={COLORS.primary}
          />
          <Text style={styles.welcomeTitle}>How can I help you?</Text>
          <Text style={styles.welcomeText}>
            Ask me anything about your security analysis, recommendations, or
            how to improve your security posture.
          </Text>

          <View style={styles.quickQuestions}>
            <Text style={styles.quickQuestionsTitle}>Quick Questions</Text>
            {QUICK_QUESTIONS.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickQuestion}
                onPress={() => onQuickQuestion(question)}
              >
                <Text style={styles.quickQuestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {chatHistory.map((msg: ChatMessage) => (
        <View
          key={msg.id}
          style={{
            alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
            maxWidth: "80%",
            marginVertical: 6,
            padding: 12,
            borderRadius: 18,
            backgroundColor: msg.sender === "user" ? COLORS.primary : "#212c38",
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text
            style={{
              color: msg.sender === "user" ? "#fff" : "#e0f7fa",
              fontSize: 15,
            }}
          >
            {msg.text}
          </Text>
          <Text
            style={{
              color: "#888",
              fontSize: 11,
              alignSelf: "flex-end",
              marginTop: 4,
            }}
          >
            {msg.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      ))}

      {chatLoading && (
        <View style={styles.thinkingIndicator}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.thinkingText}>AI is thinking...</Text>
        </View>
      )}
    </ScrollView>

    <View style={styles.chatInputContainer}>
      <TextInput
        value={chatInput}
        onChangeText={setChatInput}
        placeholder="Ask about your security analysis..."
        placeholderTextColor="#888"
        style={styles.chatInput}
        multiline
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          (!chatInput.trim() || chatLoading) && styles.sendButtonDisabled,
        ]}
        onPress={onSend}
        disabled={!chatInput.trim() || chatLoading}
      >
        <Ionicons name="send" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  </Animated.View>
);

// Helper functions
const getThreatColor = (level: string) => {
  switch (level) {
    case "High":
      return "#ff4d4d";
    case "Medium":
      return "#FFD700";
    case "Low":
      return "#00ffcc";
    default:
      return "#888";
  }
};

const generateThreatBreakdown = (data: any) => {
  const score = data.aiScore;
  return [
    {
      category: "Network",
      level: score > 80 ? "Low" : score > 60 ? "Medium" : "High",
      score: Math.max(40, score - 15),
      icon: "wifi",
    },
    {
      category: "Applications",
      level: score > 85 ? "Low" : score > 65 ? "Medium" : "High",
      score: Math.max(45, score - 10),
      icon: "apps",
    },
    {
      category: "System",
      level: score > 75 ? "Low" : score > 55 ? "Medium" : "High",
      score: Math.max(35, score - 20),
      icon: "settings",
    },
    {
      category: "Data",
      level: score > 82 ? "Low" : score > 62 ? "Medium" : "High",
      score: Math.max(50, score - 5),
      icon: "lock-closed",
    },
  ];
};

// === Modular Export Function (PDF) ===
const exportSecurityReportPDF = async (
  reportData: any,
  onStart?: () => void,
  onComplete?: () => void,
  onError?: (err: any) => void
) => {
  if (!reportData) return;
  if (onStart) onStart();
  try {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; background: #f8f9fa; }
            h1 { color: #007a5c; }
            h2 { color: #00bf8f; margin-top: 24px; }
            .divider { border-bottom: 1px solid #ddd; margin: 18px 0; }
            .section { margin-bottom: 18px; }
            .recommendation { margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <h1>Armora-X Security Report</h1>
          <div class="divider"></div>
          <div class="section">
            <strong>Generated:</strong> ${new Date(
              reportData.timestamp
            ).toLocaleString()}<br/>
            <strong>Analysis ID:</strong> ${reportData.analysisId || "N/A"}
          </div>
          <div class="divider"></div>
          <h2>System Overview</h2>
          <div class="section">
            <strong>Score:</strong> ${reportData.aiScore}/100<br/>
            <strong>Vulnerability Level:</strong> ${
              reportData.vulnerabilityLevel
            }<br/>
            <strong>Summary:</strong> ${reportData.summary}
          </div>
          <div class="divider"></div>
          <h2>Threat Analysis</h2>
          <div class="section">
            ${
              reportData.threatBreakdown
                ?.map(
                  (t: any) =>
                    `<div>• ${t.category}: ${t.level} (${t.score}%)</div>`
                )
                .join("") || "No significant threats detected."
            }
          </div>
          <div class="divider"></div>
          <h2>Recommendations</h2>
          <div class="section">
            ${
              reportData.recommendations
                ?.map(
                  (rec: any, i: number) =>
                    `<div class="recommendation">${i + 1}. <strong>${
                      rec.title
                    }</strong><br/>${rec.details}</div>`
                )
                .join("") || "No active recommendations."
            }
          </div>
          <div class="divider"></div>
          <h2>Security News</h2>
          <div class="section">
            ${
              reportData.securityNews
                ?.map(
                  (news: any) =>
                    `<div>• ${news.headline} (${news.source})</div>`
                )
                .join("") || "No recent security news."
            }
          </div>
          <div class="divider"></div>
          <h2>Quick Security Actions</h2>
          <div class="section">
            <ol>
              <li>Update all software</li>
              <li>Change default passwords</li>
              <li>Enable two-factor authentication</li>
              <li>Regularly backup data</li>
              <li>Review app permissions</li>
            </ol>
          </div>
          <div class="divider"></div>
          <div style="margin-top: 24px; color: #888; font-size: 13px;">Generated by Armora-X Security Agent</div>
        </body>
      </html>
    `;
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Security Report PDF",
      });
    } else {
      Alert.alert("Export Complete", "PDF report saved to device storage.");
    }
    if (onComplete) onComplete();
  } catch (err) {
    if (onError) onError(err);
    else Alert.alert("Export Failed", "Could not export the PDF report.");
  }
};

// Main Component
export default function AISecurityAgent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [priorityFixes, setPriorityFixes] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);

  type ChatMessage = {
    id: string;
    sender: "user" | "ai";
    text: string;
    timestamp: Date;
  };

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatScrollRef = useRef<ScrollView>(null);

  // Auto-scroll chat
  useEffect(() => {
    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [chatHistory]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setChatHistory([]);
    setPriorityFixes([]);

    try {
      const { data } = await axios.get(`${API_URL}/ai/`);

      const enhancedResult = {
        ...data,
        timestamp: new Date().toISOString(),
        analysisId: `scan_${Date.now()}`,
        threatBreakdown: generateThreatBreakdown(data),
      };

      setResult(enhancedResult);
      setPriorityFixes(extractPriorityFixes(enhancedResult));
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to analyze system security. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const extractPriorityFixes = (result: any) => {
    const fixes = [];
    if (result.aiScore < 50) {
      fixes.push({
        id: "critical_score",
        title: "Critical Security Score",
        description: "Immediate action required to improve security posture",
        priority: "critical",
        action: "view_recommendations",
        icon: "alert-circle",
      });
    }
    return fixes;
  };

  // Replace export button logic
  const handleExportReport = async () => {
    exportSecurityReportPDF(
      result,
      () => setExporting(true),
      () => setExporting(false),
      () => setExporting(false)
    );
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || !result) return;

    const userMessage = chatInput.trim();
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text: userMessage,
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, newMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/ai/chat`, {
        analysisData: result,
        message: userMessage,
      });

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text:
          data.reply ||
          "I've analyzed your security query and can provide guidance.",
        timestamp: new Date(),
      };

      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        sender: "ai",
        text: "I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setChatInput(question);
  };

  const handleFixPress = (fix: any) => {
    Alert.alert(fix.title, fix.description);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.black, COLORS.black, COLORS.cardBackground]}
        style={styles.background}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <HeaderSection onAnalyze={handleAnalyze} loading={loading} />

            {/* Analyze Button */}
            <AnalyzeButton onPress={handleAnalyze} loading={loading} />

            {/* Error Display */}
            {error ? (
              <Animated.View
                entering={FadeInUp.duration(500)}
                style={styles.errorCard}
              >
                <Ionicons name="warning-outline" size={20} color="#ff4d4d" />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            ) : null}

            {/* Results */}
            {result && (
              <View style={styles.resultsContainer}>
                <SecurityScoreCard result={result} />

                <PriorityFixesSection
                  fixes={priorityFixes}
                  onFixPress={handleFixPress}
                />

                <ThreatBreakdownSection threats={result.threatBreakdown} />

                <RecommendationsSection
                  recommendations={result.recommendations}
                  onExport={handleExportReport}
                />
              </View>
            )}

            {/* AI Chat */}
            <AIChatSection
              chatHistory={chatHistory}
              chatInput={chatInput}
              setChatInput={setChatInput}
              onSend={handleChatSend}
              chatLoading={chatLoading}
              onQuickQuestion={handleQuickQuestion}
              chatScrollRef={chatScrollRef}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  background: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 30 },

  // Header
  headerCard: {
    width: width * 0.92,
    borderRadius: 24,
    alignItems: "center",
    paddingVertical: 32,
    marginBottom: 24,
    alignSelf: "center",
    shadowColor: "#00bf8f",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  headerIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  scanBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  scanBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  // Analyze Button
  scanButton: {
    width: width * 0.85,
    borderRadius: 16,
    marginBottom: 16,
    alignSelf: "center",
    shadowColor: "#00bf8f",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  scanButtonDisabled: { opacity: 0.7 },
  scanButtonGradient: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },

  // Error
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,77,77,0.1)",
    borderLeftWidth: 4,
    borderLeftColor: "#ff4d4d",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: width * 0.92,
    alignSelf: "center",
  },
  errorText: {
    color: "#ff4d4d",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },

  // Results
  resultsContainer: {
    paddingHorizontal: 16,
    gap: 20,
    marginBottom: 20,
  },

  // Score Card
  scoreCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  scoreTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  scoreMain: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 20,
  },
  scoreValue: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "800",
  },
  scoreTotal: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 24,
    fontWeight: "600",
    marginLeft: 4,
  },
  confidenceContainer: {
    marginBottom: 16,
  },
  confidenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  confidenceLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  confidencePercent: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  meterContainer: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  meterFill: {
    height: "100%",
    borderRadius: 4,
  },
  statusBadge: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  // Priority Section
  prioritySection: {
    backgroundColor: "rgba(255,77,77,0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,77,77,0.1)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },
  fixesScroll: {
    paddingVertical: 4,
  },
  fixCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    width: 200,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  fixHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fixTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  fixDescription: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  fixButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  fixButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Threat Section
  threatSection: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  threatsGrid: {
    gap: 12,
  },
  threatItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  threatInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  threatCategory: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  threatDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  threatLevel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  threatLevelText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  threatScore: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "right",
  },

  // Recommendations
  recommendationsCard: {
    backgroundColor: "rgba(255,215,0,0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.1)",
  },
  recommendationsList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  recommendationItem: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  recommendationTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  recommendationDetails: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    lineHeight: 16,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#000",
  },
  exportButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  exportButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  exportButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Chat Section
  chatSection: {
    backgroundColor: "rgba(255,255,255,0.03)",
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  chatHeaderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  chatTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  chatStatus: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "500",
  },
  chatMessages: {
    maxHeight: 300,
    padding: 16,
  },
  welcomeMessage: {
    alignItems: "center",
    paddingVertical: 20,
  },
  welcomeTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  quickQuestions: {
    width: "100%",
  },
  quickQuestionsTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  quickQuestion: {
    backgroundColor: "rgba(0,255,204,0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(0,255,204,0.2)",
  },
  quickQuestionText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: "rgba(0,255,204,0.15)",
    borderWidth: 1,
    borderColor: "rgba(0,255,204,0.3)",
  },
  aiBubble: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  messageText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  messageTime: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    alignSelf: "flex-end",
  },
  thinkingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  thinkingText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "500",
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  chatInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    color: "#fff",
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
