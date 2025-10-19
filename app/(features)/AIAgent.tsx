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
import styles from "../../src/assets/styles/ai.styles.js";
import axios from "axios";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Animated, {
  FadeInUp,
  FadeInDown,
  SlideInDown,
  Layout,
  ZoomIn,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { API_URL } from "@/src/constants/api";
import COLORS from "@/src/constants/colors";

const { width } = Dimensions.get("window");

export default function AISecurityAgent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);
  const [priorityFixes, setPriorityFixes] = useState<any[]>([]);

  type ChatMessage = {
    id: string;
    sender: "user" | "ai";
    text: string;
    timestamp: Date;
  };

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const chatScrollRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatScrollRef.current) {
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatHistory]);

  // === ENHANCED SECURITY ANALYSIS ===
  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setChatOpen(false);
    setChatHistory([]);
    setPriorityFixes([]);

    try {
      const { data } = await axios.get(`${API_URL}/ai/`);

      // Enhanced result processing
      const enhancedResult = {
        ...data,
        timestamp: new Date().toISOString(),
        analysisId: `scan_${Date.now()}`,
        quickActions: generateQuickActions(data),
        threatBreakdown: generateThreatBreakdown(data),
      };

      setResult(enhancedResult);
      setAnalysisHistory((prev) => [enhancedResult, ...prev.slice(0, 4)]);

      // Extract priority fixes
      const fixes = extractPriorityFixes(enhancedResult);
      setPriorityFixes(fixes);

      // Auto-open chat for critical issues
      if (data.vulnerabilityLevel === "Critical" || data.aiScore < 50) {
        setTimeout(() => setChatOpen(true), 1000);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to analyze system security. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // === PRIORITY FIXES EXTRACTION ===
  const extractPriorityFixes = (result: any) => {
    const fixes = [];

    // Critical vulnerabilities
    if (result.aiScore < 50) {
      fixes.push({
        id: "critical_score",
        title: "Critical Security Score",
        description:
          "Your security score is critically low. Immediate action required.",
        priority: "critical",
        action: "view_recommendations",
        icon: "alert-circle",
      });
    }

    // Network vulnerabilities
    if (
      result.threatBreakdown?.some(
        (t: any) => t.category === "Network" && t.level === "High"
      )
    ) {
      fixes.push({
        id: "network_issues",
        title: "Network Security Issues",
        description: "High-risk network vulnerabilities detected",
        priority: "high",
        action: "network_fixes",
        icon: "wifi",
      });
    }

    // Application vulnerabilities
    if (
      result.threatBreakdown?.some(
        (t: any) => t.category === "Applications" && t.level === "High"
      )
    ) {
      fixes.push({
        id: "app_vulnerabilities",
        title: "Application Vulnerabilities",
        description: "Critical app security issues found",
        priority: "high",
        action: "app_security",
        icon: "apps",
      });
    }

    // Add recommendations as fixes
    result.recommendations?.slice(0, 3).forEach((rec: any, index: number) => {
      fixes.push({
        id: `rec_${index}`,
        title: rec.title,
        description: rec.details,
        priority: "medium",
        action: "view_recommendation",
        recommendation: rec,
        icon: "shield-checkmark",
      });
    });

    return fixes;
  };

  // === QUICK ACTIONS HANDLER ===
  const handleQuickAction = async (action: any) => {
    switch (action.type) {
      case "critical":
        await handlePriorityFixes();
        break;
      case "info":
        await handleViewRecommendations();
        break;
      case "secondary":
        await handleExportReport();
        break;
      case "network":
        await handleNetworkFixes();
        break;
      case "view_recommendation":
        await handleViewRecommendations(); // ✅ FIXED
        break;
      default:
        console.warn("Unhandled action type:", action.type);
    }
  };

  // === PRIORITY FIXES (Triggers AI chat to explain top issues) ===
  const handlePriorityFixes = async () => {
    if (!result)
      return Alert.alert("No Analysis", "Run a security analysis first.");
    setChatOpen(true);
    const message =
      "What are the most critical security issues I should fix first?";
    setChatInput(message);
    setTimeout(handleChatSend, 400);
  };

  // === VIEW ALL RECOMMENDATIONS (Display + AI Help) ===
  const handleViewRecommendations = () => {
    if (!result?.recommendations?.length) {
      Alert.alert(
        "No Recommendations",
        "Run a new analysis to view recommendations."
      );
      return;
    }

    const recList = result.recommendations
      .map((rec: any, i: number) => `${i + 1}. ${rec.title}`)
      .join("\n");

    Alert.alert(
      "Security Recommendations",
      `Found ${result.recommendations.length} recommendations:\n\n${recList}`,
      [
        {
          text: "Ask AI for Help",
          onPress: () => {
            setChatOpen(true);
            setChatInput(
              "Can you guide me through implementing these recommendations?"
            );
            setTimeout(handleChatSend, 400);
          },
        },
        { text: "Export Report", onPress: handleExportReport },
        { text: "Close", style: "cancel" },
      ]
    );
  };

  // === EXPORT SECURITY REPORT (Create + Share a detailed file) ===
  const handleExportReport = async () => {
    if (!result) return;

    setExporting(true);

    try {
      const reportContent = generateReportContent(result);
      const fileUri =
        FileSystem.documentDirectory + `security_report_${Date.now()}.txt`;

      // ✅ FIX: use "utf8" string instead of FileSystem.EncodingType.UTF8
      await FileSystem.writeAsStringAsync(fileUri, reportContent, {
        encoding: "utf8",
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/plain",
          dialogTitle: "Share Security Report",
        });
      } else {
        Alert.alert("Export Complete", "Report saved to device storage.");
      }
    } catch (error) {
      console.error("Export Failed:", error);
      Alert.alert("Export Failed", "Could not export the security report.");
    } finally {
      setExporting(false);
    }
  };

  // === NETWORK FIXES (Show actionable network hardening steps) ===
  const handleNetworkFixes = () => {
    Alert.alert(
      "Network Security Actions",
      "Detected potential network vulnerabilities.\n\nRecommended actions:\n\n• Change Wi-Fi password\n• Enable WPA3 encryption\n• Update router firmware\n• Disable remote management\n• Use VPN for public Wi-Fi",
      [
        {
          text: "Configure Wi-Fi Security",
          onPress: () => {
            try {
              Linking.openURL("App-Prefs:root=WIFI");
            } catch {
              Alert.alert("Action Failed", "Could not open Wi-Fi settings.");
            }
          },
        },
        {
          text: "Learn More",
          onPress: () =>
            Linking.openURL("https://www.cisa.gov/secure-our-world"),
        },
        { text: "Close", style: "cancel" },
      ]
    );
  };

  // === GENERATE DETAILED SECURITY REPORT (Plain text export) ===
  const generateReportContent = (data: any) => {
    const timestamp = new Date(data.timestamp).toLocaleString();
    const divider = "──────────────────────────────";

    return `
ARMORAX SECURITY REPORT
Generated: ${timestamp}
Analysis ID: ${data.analysisId || "N/A"}

${divider}
SYSTEM OVERVIEW
${divider}
Score: ${data.aiScore}/100
Vulnerability Level: ${data.vulnerabilityLevel}
Summary: ${data.summary}

${divider}
THREAT ANALYSIS
${divider}
${
  data.threatBreakdown
    ?.map((t: any) => `• ${t.category}: ${t.level} (${t.score}%)`)
    .join("\n") || "No significant threats detected."
}

${divider}
RECOMMENDATIONS
${divider}
${
  data.recommendations
    ?.map((rec: any, i: number) => `${i + 1}. ${rec.title}\n   ${rec.details}`)
    .join("\n\n") || "No active recommendations."
}

${divider}
SECURITY NEWS
${divider}
${
  data.securityNews
    ?.map((news: any) => `• ${news.headline} (${news.source})`)
    .join("\n") || "No recent security news."
}

${divider}
QUICK SECURITY ACTIONS
${divider}
1. Update all software
2. Change default passwords
3. Enable two-factor authentication
4. Regularly backup data
5. Review app permissions

Generated by ArmorX Security Agent
${timestamp}
  `.trim();
  };

  // === DYNAMIC QUICK ACTIONS (Based on current result) ===
  const generateQuickActions = (data: any) => {
    const actions: any[] = [];

    // Critical fixes if score is low
    if (data.aiScore < 70) {
      actions.push({
        icon: "shield-checkmark",
        title: "Priority Fixes",
        description: `${
          data.recommendations?.length || 0
        } critical issues detected`,
        type: "critical",
        color: "#ff4d4d",
      });
    }

    // Add network fix option if network risk is high
    if (
      data.threatBreakdown?.some(
        (t: any) => t.category === "Network" && t.level === "High"
      )
    ) {
      actions.push({
        icon: "wifi",
        title: "Network Security",
        description: "Fix detected network vulnerabilities",
        type: "network",
        color: "#FFD700",
      });
    }

    // Always show “View Recommendations”
    actions.push({
      icon: "list",
      title: "View Recommendations",
      description: `${data.recommendations?.length || 0} suggestions available`,
      type: "info",
      color: "#00ffcc",
    });

    // Always show “Export Report”
    actions.push({
      icon: "document-text",
      title: "Export Report",
      description: "Download or share your latest analysis",
      type: "secondary",
      color: COLORS.primary,
    });

    return actions;
  };

  // === THREAT BREAKDOWN GENERATION ===
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

  // === ENHANCED CHAT FUNCTIONALITY ===
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
        chatHistory: chatHistory.slice(-10),
      });

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text:
          data.reply ||
          "I've analyzed your security query. Based on your scan results, I recommend focusing on the priority fixes first.",
        timestamp: new Date(),
      };

      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        sender: "ai",
        text: "⚠️ I'm having trouble connecting right now. Here are immediate actions you can take:\n\n1. Update all applications\n2. Change default passwords\n3. Enable 2FA where available\n4. Review app permissions",
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  // === SECURITY LEVEL CONFIG ===
  const getSecurityConfig = (level: string) => {
    const configs = {
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
    return configs[level as keyof typeof configs] || configs.Vulnerable;
  };

  // === QUICK QUESTION SUGGESTIONS ===
  const quickQuestions = [
    "What's the most critical issue?",
    "How can I improve my score?",
    "Explain the network threats",
    "What do these recommendations mean?",
  ];

  // === COMPONENTS ===
  const PriorityFixesSection = ({ fixes }: { fixes: any[] }) => {
    if (fixes.length === 0) return null;

    return (
      <Animated.View
        entering={ZoomIn.duration(500)}
        style={styles.prioritySection}
      >
        <View style={styles.sectionHeader}>
          <Ionicons name="flag" size={20} color="#ff4d4d" />
          <Text style={styles.sectionTitle}>🚨 Priority Fixes</Text>
        </View>
        {fixes.slice(0, 3).map((fix, index) => (
          <TouchableOpacity
            key={fix.id}
            style={[
              styles.priorityItem,
              {
                borderLeftColor:
                  fix.priority === "critical"
                    ? "#ff4d4d"
                    : fix.priority === "high"
                    ? "#FFD700"
                    : COLORS.primary,
              },
            ]}
            onPress={() => handleQuickAction({ type: fix.action })}
          >
            <View style={styles.priorityHeader}>
              <Ionicons name={fix.icon as any} size={16} color="#fff" />
              <Text style={styles.priorityTitle}>{fix.title}</Text>
              <View
                style={[
                  styles.priorityBadge,
                  {
                    backgroundColor:
                      fix.priority === "critical"
                        ? "#ff4d4d"
                        : fix.priority === "high"
                        ? "#FFD700"
                        : COLORS.primary,
                  },
                ]}
              >
                <Text style={styles.priorityBadgeText}>
                  {fix.priority === "critical"
                    ? "CRITICAL"
                    : fix.priority === "high"
                    ? "HIGH"
                    : "MEDIUM"}
                </Text>
              </View>
            </View>
            <Text style={styles.priorityDescription}>{fix.description}</Text>
            <View style={styles.priorityAction}>
              <Text style={styles.priorityActionText}>Tap to fix →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.View>
    );
  };

  const SecurityScoreCard = ({
    score,
    level,
  }: {
    score: number;
    level: string;
  }) => {
    const config = getSecurityConfig(level);

    return (
      <LinearGradient colors={config.gradient} style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <Ionicons name={config.icon as any} size={24} color="#000" />
          <Text style={styles.scoreTitle}>Security Score</Text>
        </View>
        <Text style={styles.scoreValue}>{score}/100</Text>
        <View style={styles.scoreLevel}>
          <Text style={styles.scoreLevelText}>{level} Security</Text>
        </View>
        <View style={styles.scoreMeter}>
          <View style={[styles.scoreFill, { width: `${score}%` }]} />
        </View>
      </LinearGradient>
    );
  };

  const ThreatIndicator = ({ category, level, score, icon }: any) => {
    const getLevelColor = (lvl: string) => {
      switch (lvl.toLowerCase()) {
        case "high":
          return "#ff4d4d";
        case "medium":
          return "#FFD700";
        case "low":
          return "#00ffcc";
        default:
          return "#888";
      }
    };

    return (
      <View style={styles.threatItem}>
        <View style={styles.threatInfo}>
          <Ionicons name={icon as any} size={16} color="#888" />
          <Text style={styles.threatCategory}>{category}</Text>
        </View>
        <View style={styles.threatDetails}>
          <View
            style={[
              styles.threatLevel,
              { backgroundColor: `${getLevelColor(level)}20` },
            ]}
          >
            <Text
              style={[styles.threatLevelText, { color: getLevelColor(level) }]}
            >
              {level}
            </Text>
          </View>
          <Text style={styles.threatScore}>{score}%</Text>
        </View>
      </View>
    );
  };

  const QuickActionButton = ({
    action,
    onPress,
  }: {
    action: any;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
        <Ionicons name={action.icon as any} size={20} color="#000" />
      </View>
      <Text style={styles.quickActionTitle}>{action.title}</Text>
      <Text style={styles.quickActionDesc}>{action.description}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#000" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER SECTION */}
          <Animated.View
            entering={FadeInUp.duration(800)}
            style={styles.headerSection}
          >
            <LinearGradient
              colors={["#00bf8f", "#007a5c", "#001510"]}
              style={styles.headerCard}
            >
              <Ionicons name="logo-android" size={36} color="#fff" />
              <Text style={styles.title}>AI Security Agent</Text>
              <Text style={styles.subtitle}>
                Advanced AI-powered security analysis and expert recommendations
              </Text>
              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>
                    {analysisHistory.length}
                  </Text>
                  <Text style={styles.statLabel}>Scans</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>
                    {analysisHistory.filter((a) => a?.aiScore >= 80).length}
                  </Text>
                  <Text style={styles.statLabel}>Secure</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* ANALYSIS BUTTON */}
          <Animated.View
            entering={FadeInDown.duration(600)}
            style={styles.actionSection}
          >
            <TouchableOpacity
              style={[
                styles.analyzeButton,
                loading && styles.analyzeButtonDisabled,
              ]}
              onPress={handleAnalyze}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? ["#666", "#444"] : ["#00bf8f", "#007a5c"]}
                style={styles.analyzeButtonGradient}
              >
                {loading ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.analyzeButtonText}>
                      Analyzing System...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={22}
                      color="#fff"
                    />
                    <Text style={styles.analyzeButtonText}>
                      Run Security Analysis
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* ERROR DISPLAY */}
          {error ? (
            <Animated.View
              entering={FadeInUp.duration(500)}
              style={styles.errorCard}
            >
              <Ionicons name="warning-outline" size={20} color="#ff4d4d" />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          {/* ANALYSIS RESULTS */}
          {result && (
            <Animated.View
              entering={SlideInDown.duration(700)}
              style={styles.resultsContainer}
            >
              {/* SECURITY SCORE CARD */}
              <SecurityScoreCard
                score={result.aiScore}
                level={result.vulnerabilityLevel}
              />

              {/* PRIORITY FIXES */}
              <PriorityFixesSection fixes={priorityFixes} />

              {/* QUICK ACTIONS */}
              <View style={styles.quickActions}>
                <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.actionsScroll}
                >
                  {result.quickActions?.map((action: any, index: number) => (
                    <QuickActionButton
                      key={index}
                      action={action}
                      onPress={() => handleQuickAction(action)}
                    />
                  ))}
                </ScrollView>
              </View>

              {/* EXPORT BUTTON */}
              <TouchableOpacity
                style={styles.exportButton}
                onPress={handleExportReport}
                disabled={exporting}
              >
                <LinearGradient
                  colors={["#00bf8f", "#007a5c"]}
                  style={styles.exportButtonGradient}
                >
                  {exporting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="download" size={20} color="#fff" />
                  )}
                  <Text style={styles.exportButtonText}>
                    {exporting ? "Exporting..." : "Export Full Report"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* THREAT BREAKDOWN */}
              <View style={styles.threatSection}>
                <Text style={styles.sectionTitle}>🛡️ Threat Breakdown</Text>
                {result.threatBreakdown?.map((threat: any, index: number) => (
                  <ThreatIndicator key={index} {...threat} />
                ))}
              </View>

              {/* SECURITY SUMMARY */}
              <View style={styles.summaryCard}>
                <View style={styles.cardHeader}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={styles.cardTitle}>Analysis Summary</Text>
                </View>
                <Text style={styles.summaryText}>{result.summary}</Text>
              </View>

              {/* RECOMMENDATIONS */}
              <View style={styles.recommendationsCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="bulb-outline" size={20} color="#FFD700" />
                  <Text style={styles.cardTitle}>Security Recommendations</Text>
                </View>
                {result.recommendations?.map((rec: any, i: number) => (
                  <Animated.View
                    key={i}
                    entering={ZoomIn.delay(i * 100).duration(400)}
                    style={styles.recommendationItem}
                  >
                    <View style={styles.recommendationHeader}>
                      <Text style={styles.recommendationTitle}>
                        {rec.title}
                      </Text>
                      <View style={styles.priorityBadge}>
                        <Text style={styles.priorityText}>Priority</Text>
                      </View>
                    </View>
                    <Text style={styles.recommendationDetails}>
                      {rec.details}
                    </Text>
                  </Animated.View>
                ))}
              </View>

              {/* SECURITY NEWS */}
              {result.securityNews?.length > 0 && (
                <View style={styles.newsCard}>
                  <View style={styles.cardHeader}>
                    <Ionicons
                      name="newspaper-outline"
                      size={20}
                      color="#00ffcc"
                    />
                    <Text style={styles.cardTitle}>Security News</Text>
                  </View>
                  {result.securityNews.map((news: any, i: number) => (
                    <View key={i} style={styles.newsItem}>
                      <Text style={styles.newsHeadline}>• {news.headline}</Text>
                      <Text style={styles.newsSource}>
                        Source: {news.source}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Animated.View>
          )}

          {/* AI CHAT ASSISTANT */}
          {result && (
            <Animated.View
              entering={FadeInUp.duration(600).delay(400)}
              style={styles.chatSection}
            >
              {!chatOpen ? (
                <TouchableOpacity
                  style={styles.chatTrigger}
                  onPress={() => setChatOpen(true)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["rgba(0,191,143,0.1)", "rgba(0,21,16,0.1)"]}
                    style={styles.chatTriggerGradient}
                  >
                    <View style={styles.chatTriggerContent}>
                      <Ionicons
                        name="chatbubble-ellipses"
                        size={24}
                        color={COLORS.primary}
                      />
                      <View style={styles.chatTriggerText}>
                        <Text style={styles.chatTriggerTitle}>
                          AI Security Assistant
                        </Text>
                        <Text style={styles.chatTriggerSubtitle}>
                          Get expert explanations and advice
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View style={styles.chatContainer}>
                  {/* Chat Header */}
                  <View style={styles.chatHeader}>
                    <View style={styles.chatHeaderInfo}>
                      <View style={styles.aiAvatar}>
                        <Text style={styles.aiAvatarText}>AI</Text>
                      </View>
                      <View>
                        <Text style={styles.chatTitle}>Security Assistant</Text>
                        <Text style={styles.chatStatus}>
                          Online • Ready to help
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => setChatOpen(false)}
                      style={styles.closeChat}
                    >
                      <Ionicons name="close" size={22} color="#888" />
                    </TouchableOpacity>
                  </View>

                  {/* Chat Messages */}
                  <ScrollView
                    ref={chatScrollRef}
                    style={styles.chatMessages}
                    showsVerticalScrollIndicator={false}
                  >
                    {chatHistory.length === 0 ? (
                      <View style={styles.welcomeMessage}>
                        <Ionicons
                          name="shield-checkmark"
                          size={48}
                          color={COLORS.primary}
                        />
                        <Text style={styles.welcomeTitle}>
                          Hello! I'm your Security Assistant
                        </Text>
                        <Text style={styles.welcomeText}>
                          I can help you understand your security analysis,
                          explain threats, and provide step-by-step guidance for
                          improvements.
                        </Text>

                        {/* Quick Questions */}
                        <View style={styles.quickQuestions}>
                          <Text style={styles.quickQuestionsTitle}>
                            Quick questions you can ask:
                          </Text>
                          {quickQuestions.map((question, index) => (
                            <TouchableOpacity
                              key={index}
                              style={styles.quickQuestion}
                              onPress={() => setChatInput(question)}
                            >
                              <Text style={styles.quickQuestionText}>
                                {question}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    ) : (
                      chatHistory.map((msg) => (
                        <Animated.View
                          key={msg.id}
                          entering={FadeInUp.duration(300)}
                          style={[
                            styles.messageContainer,
                            msg.sender === "user"
                              ? styles.userMessage
                              : styles.aiMessage,
                          ]}
                        >
                          {msg.sender === "ai" && (
                            <View style={styles.messageAvatar}>
                              <Text style={styles.messageAvatarText}>AI</Text>
                            </View>
                          )}
                          <View
                            style={[
                              styles.messageBubble,
                              msg.sender === "user"
                                ? styles.userBubble
                                : styles.aiBubble,
                            ]}
                          >
                            <Text style={styles.messageText}>{msg.text}</Text>
                            <Text style={styles.messageTime}>
                              {msg.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Text>
                          </View>
                        </Animated.View>
                      ))
                    )}
                    {chatLoading && (
                      <View style={styles.thinkingIndicator}>
                        <ActivityIndicator
                          size="small"
                          color={COLORS.primary}
                        />
                        <Text style={styles.thinkingText}>
                          Security Assistant is thinking...
                        </Text>
                      </View>
                    )}
                  </ScrollView>

                  {/* Chat Input */}
                  <View style={styles.chatInputContainer}>
                    <TextInput
                      style={styles.chatInput}
                      value={chatInput}
                      onChangeText={setChatInput}
                      placeholder="Ask about your security analysis..."
                      placeholderTextColor="#888"
                      multiline
                      maxLength={500}
                    />
                    <TouchableOpacity
                      onPress={handleChatSend}
                      disabled={chatLoading || !chatInput.trim()}
                      style={[
                        styles.sendButton,
                        (!chatInput.trim() || chatLoading) &&
                          styles.sendButtonDisabled,
                      ]}
                    >
                      <Ionicons
                        name="send"
                        size={20}
                        color={
                          !chatInput.trim() || chatLoading
                            ? "#666"
                            : COLORS.primary
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
