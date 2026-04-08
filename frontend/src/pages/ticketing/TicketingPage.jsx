import "../../components/ticketing/ticketing.css";
import { getAuth } from "../../services/authStorage";
import StudentTicketView from "./StudentTicketView";
import AdminTicketView from "./AdminTicketView";
import TechnicianTicketView from "./TechnicianTicketView";

export default function TicketingPage() {
  const auth = getAuth();
  const role = (auth?.role || "USER").toUpperCase();

  if (role === "ADMIN") return <AdminTicketView />;
  if (role === "TECHNICIAN") return <TechnicianTicketView />;
  return <StudentTicketView />;
}
