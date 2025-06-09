import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const BookReg = () => {
  const { EventName, eventID } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/events/${eventID}`);
        setEventDetails(response.data);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventID]);

  console.log(eventDetails);

  if (loading) return <p>Loading event details...</p>;

  if (!eventDetails) return <p>Event not found!</p>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-gray-800 flex items-center justify-center p-6">
      <div
        className="
      max-w-3xl w-full p-8 bg-white rounded-2xl shadow-xl border border-gray-200
      transform transition-transform duration-300 ease-in-out
      hover:scale-[1.03] hover:shadow-2xl
    "
      >
        {/* Event Title */}
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-6">{eventDetails.eventName}</h1>

        <div className="mb-8">
          <div className="prose max-w-none text-gray-800 text-lg leading-relaxed">
            {/* Image: Stacks on top in small screens, floats left in md+ */}
            <img
              src={eventDetails.companyPoster}
              alt="Company Poster"
              className="w-full mb-4 rounded-lg shadow-md object-cover max-h-[300px] md:float-left md:mr-6 md:w-1/2"
            />

            {/* Description */}
            <p className="whitespace-pre-line">
              {eventDetails.eventDescription}
            </p>
          </div>
        </div>

        {/* Roles Count Display */}
        {eventDetails.eventRoles && (
          <div className="mb-8 p-5 bg-blue-50 border border-blue-300 rounded-lg text-gray-800 text-center font-semibold text-lg shadow-sm">
            Total Roles Available: <span className="text-gray-700">{eventDetails.eventRoles.length}</span>
          </div>
        )}

        {/* Book Ticket Button */}
        <button
          onClick={() =>
            window.location.href = `https://events.aurelionfutureforge.com/${EventName}/register/${eventID}`
          }
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition duration-300"
        >
          Book Ticket
        </button>
      </div>
    </div>


  );
};

export default BookReg;
