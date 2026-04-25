import { getToken } from "./authStorage";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/users`;

export const fetchAnalyticsSummary = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/summary`, {
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
