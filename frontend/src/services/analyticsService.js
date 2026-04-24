import { getToken } from "./authStorage";
import { API_BASE_URL } from "./apiConfig";

const USERS_BASE_URL = `${API_BASE_URL}/users`;

export const fetchAnalyticsSummary = async () => {
  try {
    const response = await fetch(`${USERS_BASE_URL}/analytics/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
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
