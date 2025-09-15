// index.js
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Reschedule endpoint
app.post("/rescheduleBooking", async (req, res) => {
  const { bookingUid, start, reason } = req.body;
  try {
    const response = await fetch(`https://api.cal.com/v2/bookings/${bookingUid}/reschedule`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CALCOM_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        start,
        rescheduledBy: "agent",
        reschedulingReason: reason
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel endpoint
app.post("/cancelBooking", async (req, res) => {
  const { bookingUid, reason } = req.body;
  try {
    const response = await fetch(`https://api.cal.com/v2/bookings/${bookingUid}/cancel`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CALCOM_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cancellationReason: reason
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
