import { useScoreStore } from "../src/store/score.store";
import axios from "axios";

describe("useScoreStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.post = jest.fn();
  });

  it("analyzeDeviceSecurity sets deviceSecurity on success", async () => {
    axios.post.mockResolvedValue({
      data: { score: 8, checks: { threatLevel: "low" } },
    });
    const store = useScoreStore.getState();
    await store.analyzeDeviceSecurity();
    expect(store.deviceSecurity.score).toBe(8);
    expect(store.deviceSecurity.checks.threatLevel).toBe("low");
    expect(store.isLoading).toBe(false);
    expect(store.error).toBe(null);
  });

  it("analyzeDeviceSecurity sets error on failure", async () => {
    axios.post.mockRejectedValue(new Error("fail"));
    const store = useScoreStore.getState();
    await store.analyzeDeviceSecurity();
    expect(store.error).toBe("fail");
    expect(store.isLoading).toBe(false);
  });

  it("setDeviceSecurity updates deviceSecurity", () => {
    const store = useScoreStore.getState();
    store.setDeviceSecurity({ score: 5, checks: null, lastChecked: null });
    expect(store.deviceSecurity.score).toBe(5);
  });

  it("setLoading updates isLoading", () => {
    const store = useScoreStore.getState();
    store.setLoading(true);
    expect(store.isLoading).toBe(true);
  });
});