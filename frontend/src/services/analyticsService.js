const API_BASE_URL = "http://localhost:8080/api/users";

export const fetchAnalyticsSummary = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch analytics summary:", error);
    throw error;
  }
};
