// This file was removed in favor of new admin booking components.

import { getBookingById } from "../../services/bookingService";

function BookingDetails() {
  const [id, setId] = useState("");
  const [booking, setBooking] = useState(null);

  const handleSearch = async () => {
    try {
      const res = await getBookingById(id);
      setBooking(res.data);
    } catch (err) {
      alert("Booking not found");
    }
  };

  return (
    <div>
      <h2>Search Booking</h2>
      <input
        placeholder="Enter Booking ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      {booking && (
        <div>
          <p>Resource: {booking.resourceId}</p>
          <p>User: {booking.userId}</p>
          <p>Status: {booking.status}</p>
          <p>Purpose: {booking.purpose}</p>
        </div>
      )}
    </div>
  );
}

export default BookingDetails;