import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from "react-hot-toast";
import { CalendarDays, MapPin, Clock3, Building2, PencilLine, PlusCircle, Menu, X } from 'lucide-react'
import { NavLink } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';

export default function EventCreation() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isFreeRole, setIsFreeRole] = useState(false)
  const [eventDetails, setEventDetails] = useState({
    companyName: '',
    eventName: '',
    place: '',
    startDate: '',
    endDate: '',
    time: '',
    eventRoles: [],
    poster: null,
    eventDescription: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newRole, setNewRole] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [privilege, setPrivilege] = useState('');
  const [rolePrice, setRolePrice] = useState('');
  const [roleMaxReg, setRoleMaxReg] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPrivileges, setSelectedPrivileges] = useState([]);

  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const loggedInEmail = localStorage.getItem('adminEmail');
  const adminCompany = localStorage.getItem('adminCompanyName');

  useEffect(() => {
    const fetchEvents = async () => {
      if (!loggedInEmail) {
        toast.error('Please login to view your events');
        navigate('/event-login');
        return;
      }

      let companyName = localStorage.getItem('adminCompanyName');
      if (!companyName) {
        toast.error('Company name not found. Please login again.');
        navigate('/event-login');
        return;
      }
      if (companyName) {
        setEventDetails(prev => ({ ...prev, companyName: companyName }));
      }

      try {
        companyName = companyName
          .replace(/\+/g, " ")         
          .replace(/\s+/g, " ")        
          .trim(); 
        const response = await axios.get(`${BASE_URL}/events/get-events?companyName=${encodeURIComponent(companyName)}`);
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [loggedInEmail, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventDetails({ ...eventDetails, [name]: value });
  };

  const handlePosterChange = (e) => {
    setEventDetails({ ...eventDetails, poster: e.target.files[0] });
  };

  const handlePrivilegeChange = (selected) => {
    setSelectedPrivileges(selected || []);
    const commaSeparated = (selected || []).map(p => p.value).join(',');
    setPrivilege(commaSeparated);
  };

  const handleAddRole = () => {
    if (
      newRole.trim() &&
      roleDescription.trim() &&
      privilege.trim() &&
      rolePrice &&
      roleMaxReg
    ) {
      setEventDetails((prevDetails) => ({
        ...prevDetails,
        eventRoles: [
          ...prevDetails.eventRoles,
          {
            roleName: newRole.trim(),
            roleDescription: roleDescription.trim(),
            privileges: [privilege],
            price: Number(rolePrice),
            maxRegistrations: Number(roleMaxReg),
          },
        ],
      }));

      // Reset fields
      setNewRole('');
      setRoleDescription('');
      setPrivilege('');
      setSelectedPrivileges([]);
      setRolePrice('');
      setRoleMaxReg('');
    } else {
      toast.error('Please fill all Ticket fields, including price and max registrations');
    }
  };


  const handleDeleteRole = (index) => {
    setEventDetails((prevDetails) => ({
      ...prevDetails,
      eventRoles: prevDetails.eventRoles.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const comp = localStorage.getItem("adminCompanyName")
    const { companyName, eventName, place, time, startDate, eventRoles } = eventDetails;
    if (!companyName || !eventName || !place || !time || !startDate || eventRoles.length === 0) {
      setError("All fields are required, including at least one role.");
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const sanitizedRoles = eventDetails.eventRoles.map(role => ({
        roleName: role.roleName.trim(),
        roleDescription: role.roleDescription.trim(),
        privileges: role.privileges.map(p => p.trim()),
        price: role.price,
        maxRegistrations: role.maxRegistrations
      }));

      const formData = new FormData();
      formData.append("companyName", eventDetails.companyName);
      formData.append("eventName", eventDetails.eventName);
      formData.append("place", eventDetails.place);
      formData.append("time", eventDetails.time);
      formData.append("startDate", new Date(eventDetails.startDate).toISOString().split('T')[0]);
      if (eventDetails.endDate) {
        formData.append("endDate", new Date(eventDetails.endDate).toISOString().split('T')[0]);
      }
      formData.append("companyEmail", loggedInEmail);
      formData.append("eventRoles", JSON.stringify(sanitizedRoles));
      if (eventDetails.poster) {
        formData.append("companyPoster", eventDetails.poster);
      }
      formData.append("eventDescription", eventDetails.eventDescription);

      const response = await axios.post(`${BASE_URL}/events/create-event`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        toast.success("Event created successfully!");
        setEvents([...events, response.data.event]);
        setShowForm(false);
        setEventDetails({
          companyName: '',
          eventName: '',
          place: '',
          startDate: '',
          endDate: '',
          time: '',
          eventRoles: [],
          poster: null,
          eventDescription: ''
        });
      }
    } catch (error) {
      console.error("Error creating event:", error.response?.data || error.message);
      setError(error.response?.data?.msg || "Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (eventID) => {
    navigate(`/edit-event/${eventID}`);
  };

  const handleCreateRegForm = (eventID) => {
    navigate('/event-list');
  }

  const handleLogout = () => {
    // Example: Clear token or session
    localStorage.removeItem("admin_token");
    localStorage.removeItem("adminCompanyName"); // or any auth info
    navigate("/", { replace: true }); 
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

    if (wordCount <= 100) {
      setEventDetails(prev => ({
        ...prev,
        eventDescription: value,
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-row bg-gradient-to-r from-black to-gray-800">

      <aside
        className={`fixed z-40 top-0 left-0 min-h-screen w-[301px] bg-white text-black flex flex-col p-6 space-y-6 shadow-lg transform transition-transform duration-300 sm:static sm:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="text-2xl font-bold tracking-wide flex justify-between items-center">
          <NavLink to='/'><p>Stagyn.io</p></NavLink>
          <button
            onClick={() => setSidebarOpen(false)}
            className="sm:hidden p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-4 text-sm">
          <NavLink
            to="/create-event"
            className={({ isActive }) =>
              `w-full px-4 py-2 rounded flex items-center gap-2 transition-colors focus:outline-none ${isActive ? "bg-red-600 text-white" : "hover:bg-red-600 active:bg-red-600"
              }`
            }
          >
            Create Event
          </NavLink>
          <NavLink
            to="/event-list"
            className={({ isActive }) =>
              `w-full px-4 py-2 rounded flex items-center gap-2 transition-colors focus:outline-none ${isActive ? "hover:bg-red-600 text-black" : "hover:bg-red-600"
              }`
            }
          >
            Events
          </NavLink>
          <button
            onClick={handleLogout}
            className="hover:bg-red-600 w-full transition-colors px-4 py-2 rounded flex items-center gap-2 text-left focus:outline-none"
          >
            Logout
          </button>
        </nav>
      </aside>
      <section className="container mx-auto text-center p-6 md:p-12">
        <header className="bg-transparent px-1 py-4 text-white flex justify-start">
          <button className="sm:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </header>
        <h3 className="text-3xl font-semibold text-white mb-4">Your Events</h3>
        <div className="space-y-6">
          {events.length === 0 ? (
            <p className="text-white text-center text-lg">🎉 No events created yet. Add a new event!</p>
          ) : (
            events.map((event) => (
              <div
                key={event._id}
                className="bg-gradient-to-br from-white to-gray-100 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 border border-gray-200"
              >
                <h4 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  {event.eventName}
                </h4>

                <p className="text-gray-600 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  {event.companyName}
                </p>

                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  {event.place}
                </p>

                <p className="text-gray-600 flex items-center gap-2">
                  <Clock3 className="w-4 h-4 text-yellow-600" />
                  {event.time}
                </p>

                <p className="text-gray-600 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-red-500" />
                  {event.endDate &&
                    !isNaN(new Date(event.endDate)) &&
                    new Date(event.startDate).toLocaleDateString() !==
                    new Date(event.endDate).toLocaleDateString()
                    ? `${new Date(event.startDate).toLocaleDateString()} → ${new Date(
                      event.endDate
                    ).toLocaleDateString()}`
                    : new Date(event.startDate).toLocaleDateString()}
                </p>

                <div className="mt-6 flex justify-end gap-4">
                  {(!event.registrationFields || event.registrationFields.length === 0) && (
                    <button
                      onClick={() => handleCreateRegForm(event._id)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Create Reg Form
                    </button>
                  )}
                  <button
                    onClick={() => handleEditEvent(event._id)}
                    className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 transition"
                  >
                    <PencilLine className="w-4 h-4" />
                    Edit Event
                  </button>

                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition"
          >
            {showForm ? 'Cancel' : 'Add New Event'}
          </button>
        </div>

        {showForm && (
          <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
            <h4 className="text-2xl font-semibold mb-4">Create New Event</h4>

            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm bg-gray-200 cursor-not-allowed"
              onChange={handleChange}
              value={eventDetails.companyName}
              disabled
            />

            <input
              type="text"
              name="eventName"
              placeholder="Event Name"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={handleChange}
              value={eventDetails.eventName}
            />

            <div className="mb-6">
              <h5 className="text-lg font-semibold mb-2">Add New TICKET </h5>
              <input
                type="text"
                placeholder="New Ticket Name"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full p-3 mb-2 border rounded-lg shadow-sm"
              />
              <input
                type="text"
                placeholder="Ticket Description"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                className="w-full p-3 mb-2 border rounded-lg shadow-sm"
              />

              <CreatableSelect
                isMulti
                value={selectedPrivileges}
                onChange={handlePrivilegeChange}
                className="mb-2"
                classNamePrefix="select"
                placeholder="Enter privileges"
              />

              <div className="relative w-full mb-2">
                <input
                  type={isFreeRole ? "text" : "number"}
                  placeholder="Ticket Price"
                  value={isFreeRole ? "FREE" : rolePrice}
                  disabled={isFreeRole}
                  onChange={(e) => setRolePrice(e.target.value)}
                  className={`w-full p-3 pl-10 border rounded-lg shadow-sm ${isFreeRole ? 'w-full p-3 mb-4 border rounded-lg shadow-sm bg-gray-200 cursor-not-allowed' : ''
                    }`}
                />
                {!isFreeRole && (
                  <span className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500 text-lg">
                    ₹
                  </span>
                )}
              </div>

              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={isFreeRole}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsFreeRole(checked);
                    if (checked) {
                      setRolePrice("0");
                    } else {
                      setRolePrice("");
                    }
                  }}
                />
                <span className="text-sm font-medium">Make this Ticket free</span>
              </label>

              <input
                type="number"
                placeholder="Maximum registrations ( total seats available) "
                value={roleMaxReg}
                onChange={(e) => setRoleMaxReg(e.target.value)}
                className="w-full p-3 mb-2 border rounded-lg shadow-sm"
              />

              <button
                onClick={handleAddRole}
                className="w-full py-2 mt-2 bg-red-600 text-white font-semibold rounded-4xl shadow hover:bg-red-700"
              >
                Add Ticket
              </button>
            </div>

            <div className="mb-6">
              <h5 className="text-lg font-semibold mb-2">Selected Tickets</h5>
              {eventDetails.eventRoles.map((role, index) => (
                <div key={index} className="flex justify-between items-center mb-2 p-2 border rounded-lg bg-gray-100">
                  <div>
                    <span className="font-semibold">{role.roleName}</span> - {role.roleDescription} <br />
                    <span className="text-sm text-gray-600">Privileges: {role.privileges[0]}</span><br />
                    <span className="text-sm text-gray-600">Price: ₹{role.price}</span><br />
                    <span className="text-sm text-gray-600">Max Registrations: {role.maxRegistrations}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteRole(index)}
                    className="ml-4 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <input
              type="text"
              name="place"
              placeholder="Place"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={handleChange}
              value={eventDetails.place}
            />
            <input
              type="text"
              name="time"
              placeholder="Time (e.g., 10:00 AM)"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={handleChange}
              value={eventDetails.time}
            />
            <label><b>Start Date</b></label>
            <input
              type="date"
              name="startDate"
              placeholder="Start Date"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={handleChange}
              value={eventDetails.startDate}
              min={new Date().toISOString().split("T")[0]} 
            />
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              placeholder="End Date"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={handleChange}
              value={eventDetails.endDate}
              min={new Date().toISOString().split("T")[0]} 
            />

            <div className="mb-6">
              <label className="block mb-2 text-lg font-semibold">Upload Event Banner</label>
              <input
                type="file"
                placeholder='Upload the event logo to appear in the registration form'
                onChange={handlePosterChange}
                className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              />
            </div>

            <textarea
              name="event-description"
              placeholder="Write about the event..! (Max 100 words)"
              className="w-full p-3 mb-4 border rounded-lg shadow-sm"
              onChange={handleDescriptionChange}
              value={eventDetails.eventDescription}
              rows={5}
            />
            <p className="text-sm text-gray-500 text-right">
              {eventDetails.eventDescription.trim().split(/\s+/).filter(Boolean).length} / 100 words
            </p>

            {error && <p className="text-red-600">{error}</p>}
            <br />
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-4xl shadow hover:bg-red-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating Event...' : 'Create Event'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
