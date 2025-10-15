// src/stores/score.store.js
import { create } from "zustand";
import * as Device from "expo-device";
import axios from "axios";
import { API_URL } from "@/src/constants/api";

export const useScoreStore = create((set) => ({
  deviceSecurity: {
    score: 10,
    checks: null,
    lastChecked: null,
  },
  isLoading: false,
  error: null,

  setDeviceSecurity: (data) => set({ deviceSecurity: data }),
  setLoading: (loading) => set({ isLoading: loading }),

  analyzeDeviceSecurity: async () => {
    set({ isLoading: true, error: null });

    try {
      // Collect device info
      const payload = {
        platform: Device.osName || "Unknown",
        osVersion: Device.osVersion || "Unknown",
        model: Device.modelName || "Unknown",
        isEmulator: !Device.isDevice,
        developerMode: __DEV__,
        userAgent: Device.osBuildId || "",
      };

      const res = await axios.post(`${API_URL}/security/analyze`, payload);

      const data = {
        score: res.data.score,
        checks: res.data.checks,
        lastChecked: new Date().toISOString(),
      };

      set({ deviceSecurity: data, isLoading: false });
    } catch (err) {
      console.error("⚠️ Security analysis failed:", err.message);
      set({
        error: err.message || "Security analysis failed",
        isLoading: false,
      });
    }
  },
}));
