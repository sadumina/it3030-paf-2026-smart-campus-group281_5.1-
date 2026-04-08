// This file was removed in favor of a new StudentBookingForm component.

import { createBooking } from "../../services/bookingService";

function BookingForm() {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    resourceId: "",
    userId: "",
    date: today,
    startTime: "",  
    endTime: "",     
    purpose: "",
    expectedAttendees: 0,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const now = new Date();
    const selectedStartDateTime = new Date(`${form.date}T${form.startTime}`);

    if (selectedStartDateTime < now) {
      alert("You cannot book past dates or times. Please select a future time.");
      return;
    }

    if (form.startTime >= form.endTime) {
      alert("End time must be after the start time.");
      return;
    }

    // Combine date + time into ISO LocalDateTime strings
    const startDateTime = `${form.date}T${form.startTime}:00`;
    const endDateTime = `${form.date}T${form.endTime}:00`;

    // Prepare payload matching your Booking model
    const bookingData = {
      resourceId: form.resourceId,
      userId: form.userId,
      startTime: startDateTime,     // LocalDateTime format
      endTime: endDateTime,         // LocalDateTime format
      purpose: form.purpose,
      expectedAttendees: Number(form.expectedAttendees) || 0,
    };

    try {
      // Module B requirement: System must check for overlaps (handled in backend)
      await createBooking(bookingData);
      alert("Booking Requested Successfully!");
      
      // Optional: Reset form after success
      setForm({
        resourceId: "",
        userId: "",
        date: today,
        startTime: "",
        endTime: "",
        purpose: "",
        expectedAttendees: 0,
      });
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || "Error creating booking");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 bg-white shadow-lg rounded-xl border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Reserve a Resource
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Resource & User IDs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource ID</label>
            <input 
              name="resourceId" 
              required
              placeholder="e.g. LAB-01" 
              value={form.resourceId}
              onChange={handleChange} 
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input 
              name="userId" 
              required
              placeholder="Your ID" 
              value={form.userId}
              onChange={handleChange} 
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
          <input 
            type="date" 
            name="date" 
            min={today} 
            value={form.date}
            onChange={handleChange} 
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input 
              type="time" 
              name="startTime" 
              required
              value={form.startTime}
              onChange={handleChange} 
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input 
              type="time" 
              name="endTime" 
              required
              value={form.endTime}
              onChange={handleChange} 
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
          <input 
            name="purpose" 
            placeholder="e.g. Workshop" 
            value={form.purpose}
            onChange={handleChange} 
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Attendees */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected Attendees</label>
          <input 
            name="expectedAttendees" 
            type="number" 
            min="1"
            value={form.expectedAttendees}
            onChange={handleChange} 
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-200 mt-4"
        >
          Confirm Booking Request
        </button>
      </form>
    </div>
  );
}

export default BookingForm;