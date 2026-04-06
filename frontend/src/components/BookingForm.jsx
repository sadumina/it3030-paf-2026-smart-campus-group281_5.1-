import React, { useState } from "react";
import { createBooking } from "../services/bookingService";

function BookingForm() {
  const [form, setForm] = useState({
    resourceId: "",
    userId: "",
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
    try {
      await createBooking(form);
      alert("Booking Requested Successfully!");
    } catch (err) {
      alert(err.response?.data || "Error booking");
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
              placeholder="e.g. LAB-01" 
              onChange={handleChange} 
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input 
              name="userId" 
              placeholder="Your ID" 
              onChange={handleChange} 
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Date and Time Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input 
              type="datetime-local" 
              name="startTime" 
              onChange={handleChange} 
              className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input 
              type="datetime-local" 
              name="endTime" 
              onChange={handleChange} 
              className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Booking Purpose</label>
          <input 
            name="purpose" 
            placeholder="e.g. Project Discussion" 
            onChange={handleChange} 
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        {/* Attendees */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected Attendees</label>
          <input 
            name="expectedAttendees" 
            type="number" 
            placeholder="0"
            onChange={handleChange} 
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-200 ease-in-out transform active:scale-[0.98] mt-4"
        >
          Request Booking
        </button>
      </form>
    </div>
  );
}

export default BookingForm;