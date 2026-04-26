import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  Headphones,
  Laptop,
  LifeBuoy,
  MapPin,
  MessageSquareText,
  PhoneCall,
  Send,
  ShieldCheck,
  Wrench,
  Zap,
} from "lucide-react";
import RoleDashboardLayout from "../components/dashboard/RoleDashboardLayout";
import { getAuth } from "../services/authStorage";
import { createTicket } from "../services/ticketService";
import { userSidebar } from "../config/userDashboardConfig";

const supportTypes = [
  {
    label: "IT Support",
    category: "IT",
    priority: "MEDIUM",
    icon: Laptop,
    description: "Login, network, lab computers, software access.",
  },
  {
    label: "Facility Help",
    category: "STRUCTURAL",
    priority: "HIGH",
    icon: Wrench,
    description: "Room damage, doors, furniture, safety issues.",
  },
  {
    label: "Power or AC",
    category: "ELECTRICAL",
    priority: "HIGH",
    icon: Zap,
    description: "Electrical faults, cooling, lights, equipment power.",
  },
  {
    label: "General Guidance",
    category: "OTHER",
    priority: "LOW",
    icon: LifeBuoy,
    description: "Ask for help finding the right campus service.",
  },
];

const supportStats = [
  { label: "Average reply", value: "18 min", icon: Clock3 },
  { label: "Resolved this week", value: "126", icon: CheckCircle2 },
  { label: "Support quality", value: "4.8/5", icon: ShieldCheck },
];

const faqItems = [
  {
    question: "How do I track a support request?",
    answer: "After submitting, open Incident Reports to view ticket status, assigned technician, comments, and timeline.",
  },
  {
    question: "What should I include?",
    answer: "Add the exact location, what happened, when it started, and a reachable contact detail if urgent.",
  },
  {
    question: "When should I mark high priority?",
    answer: "Use high priority for safety, access blockers, power failures, AC failures, or issues affecting a class session.",
  },
];

const initialForm = {
  title: "",
  description: "",
  location: "",
  contactDetails: "",
  category: "IT",
  priority: "MEDIUM",
};

export default function SupportPage() {
  const auth = getAuth();
  const [form, setForm] = useState(initialForm);
  const [selectedType, setSelectedType] = useState("IT Support");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedSupport = useMemo(
    () => supportTypes.find((type) => type.label === selectedType) || supportTypes[0],
    [selectedType]
  );

  const handleSelectType = (type) => {
    setSelectedType(type.label);
    setForm((current) => ({
      ...current,
      category: type.category,
      priority: type.priority,
      title: current.title || type.label,
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      setError("Please add a title, description, and location before submitting.");
      return;
    }

    setLoading(true);
    try {
      const created = await createTicket({
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        contactDetails: form.contactDetails.trim(),
        category: form.category,
        priority: form.priority,
      });

      setMessage(`Support request ${created.ticketId || ""} submitted successfully. It is now visible in the admin incident desk for technician assignment.`);
      setForm(initialForm);
      setSelectedType("IT Support");
    } catch (requestError) {
      setError(requestError.message || "Unable to submit support request.");
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="space-y-5">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="grid gap-4 lg:grid-cols-[1fr_320px]"
      >
        <div className="rounded-md border border-orange-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Support Center</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">How can we help today?</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Choose a support type, describe the issue, and our campus team will route it to the right owner.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
              <Headphones className="h-4 w-4" />
              Live Help Desk
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {supportTypes.map((type) => {
              const Icon = type.icon;
              const isActive = selectedType === type.label;
              return (
                <button
                  key={type.label}
                  type="button"
                  onClick={() => handleSelectType(type)}
                  className={`group rounded-md border p-4 text-left transition duration-300 hover:-translate-y-1 ${
                    isActive
                      ? "border-orange-300 bg-orange-50 shadow-[0_0_0_1px_rgba(249,115,22,0.45),0_18px_38px_rgba(249,115,22,0.18)]"
                      : "border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-white hover:shadow-[0_0_0_1px_rgba(249,115,22,0.4),0_16px_34px_rgba(249,115,22,0.14)]"
                  }`}
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-orange-600 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-bold text-slate-950">{type.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3">
          {supportStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article
                key={stat.label}
                className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-[0_0_0_1px_rgba(249,115,22,0.45),0_14px_30px_rgba(249,115,22,0.15)]"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-orange-50 p-2 text-orange-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-950">{stat.value}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </motion.section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Create Support Request</h3>
              <p className="text-sm text-slate-500">Routed as {selectedSupport.category} with {form.priority} priority.</p>
            </div>
            <span className="rounded-md border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
              {selectedSupport.label}
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Issue title</span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                placeholder="Example: Cannot access lab computer"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Location</span>
              <div className="relative mt-2">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="h-11 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  placeholder="Building, floor, room"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Category</span>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              >
                <option value="IT">IT</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="HVAC">HVAC</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="STRUCTURAL">Structural</option>
                <option value="CLEANING">Cleaning</option>
                <option value="OTHER">Other</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</span>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              className="mt-2 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              placeholder="Explain what happened, when it started, and who is affected."
            />
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contact detail</span>
            <input
              name="contactDetails"
              value={form.contactDetails}
              onChange={handleChange}
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              placeholder={auth?.email || "Phone, email, or extension"}
            />
          </label>

          {error ? <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {message ? (
            <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setForm(initialForm);
                setSelectedType("IT Support");
                setError("");
                setMessage("");
              }}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-orange-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Send className="h-4 w-4" />
              {loading ? "Submitting..." : "Submit request"}
            </button>
          </div>
        </form>

        <div className="space-y-5">
          <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">Contact Channels</h3>
            <div className="mt-4 space-y-3">
              {[
                { icon: PhoneCall, title: "Urgent line", detail: "+94 11 234 5678" },
                { icon: MessageSquareText, title: "Support email", detail: "support@clevercampus.io" },
                { icon: Headphones, title: "Desk hours", detail: "8:00 AM - 6:00 PM" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                    <span className="rounded-md bg-orange-50 p-2 text-orange-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.detail}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">Support Guide</h3>
            <div className="mt-4 space-y-3">
              {faqItems.map((item) => (
                <details key={item.question} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-900">{item.question}</summary>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );

  return (
    <RoleDashboardLayout
      sectionLabel="User Support"
      dashboardTitle="Campus Support Center"
      dashboardSubtitle="Ask for help, submit requests, and get routed to the right campus team."
      roleLabel="USER"
      auth={auth}
      sidebarItems={userSidebar}
      kpis={[]}
      quickActions={[]}
      activityFeed={[]}
      chartTitle=""
      chartCaption=""
      showInsightsPanel={false}
      extraContent={content}
    />
  );
}
