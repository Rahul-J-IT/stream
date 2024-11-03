import React, { useState } from 'react';
import axios from 'axios';


const CreateEventPage = () => {
  // Form state variables
  const [eventType, setEventType] = useState('Public'); // Event type: Public or Private
  const [locationType, setLocationType] = useState('Physical'); // Location: Physical or Virtual
  const [capacity, setCapacity] = useState(50); // Default max capacity set to 50
  const [requireApproval, setRequireApproval] = useState(false); // Toggle for tickets required
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');

  // Handlers for form input
  const handleLocationChange = (event) => {
    setLocationType(event.target.value);
  };

  const handleCapacityChange = (event) => {
    const value = Math.max(1, Math.min(100, event.target.value)); // Max capacity set to 100 for flexibility
    setCapacity(value);
  };

  const handleToggleChange = () => {
    setRequireApproval(!requireApproval);
  };

  // Form submission handler
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('token');
      //const name = localStorage.getItem('name');
      console.log('Token:', token); // Debugging line
      //console.log(name)
      if (!token) {
        console.error('No token found. User might not be authenticated.');
        return;
      }

      // Collect event data to match your schema
      const eventData = {
        eventName,
        startDate,
        startTime,
        endDate,
        endTime,
        location: locationType,
        description,
        eventType,
        ticketsRequired: requireApproval,
        maxCapacity: capacity,
      };

      // Post event data to backend
    //   const response = await axios.post('http://localhost:5000/api/events', eventData, {
    //     headers: {
    //       Authorization: Bearer ${token},
    //     },
    // //   });

    //   console.log('Event created successfully:', response.data);
      
      // Redirect after successful creation
      window.location.href = '/browse'; // Adjust as needed for React Router
    } catch (error) {
    //   console.error('Error creating event:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="create-event-page">
      <h2>Create Event</h2>
      <form onSubmit={handleSubmit}>
        
        {/* Event Name */}
        <label>Event Name:</label>
        <input
          type="text"
          placeholder="Enter event name"
          required
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />

        {/* Start Date and Time */}
        <label>Start Date:</label>
        <input
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label>Start Time:</label>
        <input
          type="time"
          required
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        {/* End Date and Time */}
        <label>End Date:</label>
        <input
          type="date"
          required
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <label>End Time:</label>
        <input
          type="time"
          required
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        {/* Location: Physical or Virtual */}
        <label>Event Location:</label>
        <select value={locationType} onChange={handleLocationChange}>
          <option value="Physical">Physical</option>
          <option value="Virtual">Virtual</option>
        </select>
{/*     
        {/* Event Description */}
        <label>Description:</label>
        <textarea
          placeholder="Enter event description"
          rows="4"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        {/* Event Type: Public or Private */}
        <label>Event Type:</label>
        <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
          <option value="Public">Public</option>
          <option value="Private">Private</option>
        </select>

        {/* Tickets Required */}
        <div className="toggle-switch">
          <label>Require Tickets:</label>
          <input
            type="checkbox"
            id="requireApproval"
            checked={requireApproval}
            onChange={handleToggleChange}
          />
          <label htmlFor="requireApproval" className="switch-label"></label>
          <span>{requireApproval ? 'Yes' : 'No'}</span>
        </div>

        {/* Event Capacity */}
        <label>Max Capacity (100 max):</label>
        <input
          type="number"
          value={capacity}
          onChange={handleCapacityChange}
          min="1"
          max="100"
          required
        />

        <button type="submit">Create Event</button>
      </form>
    </div>
  );
}

export default CreateEventPage;