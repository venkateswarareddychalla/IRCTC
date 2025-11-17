import { useState, useEffect } from 'react'
import { Check, CheckCircle, Plus, Train, Users, Ticket, RefreshCw } from 'lucide-react'
import Header from '../components/Header'

function AdminDashboard({ onLogout }) {
  const [showForm, setShowForm] = useState(false);
  const [trainNumber, setTrainNumber] = useState('');
  const [trainName, setTrainName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');

  const [message, setMessage] = useState('');
  const [trains, setTrains] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);


  const fetchData = async () => {
    try {
      const [trainsRes, usersRes, bookingsRes] = await Promise.all([
        fetch('http://localhost:3000/get-trains'),
        fetch('http://localhost:3000/get-all-users'),
        fetch('http://localhost:3000/get-all-bookings')
      ]);

      const trainsData = await trainsRes.json();
      const usersData = await usersRes.json();
      const bookingsData = await bookingsRes.json();

      if (trainsData.success) setTrains(trainsData.trains);
      if (usersData.success) setUsers(usersData.users);
      if (bookingsData.success) setBookings(bookingsData.bookings);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);



  const handleAddTrain = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/add-train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          train_number: trainNumber,
          train_name: trainName,
          origin,
          destination,
          date,
          departure_time: departureTime,
          arrival_time: arrivalTime
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Train added successfully');
        setTrainNumber('');
        setTrainName('');
        setOrigin('');
        setDestination('');
        setDate('');
        setDepartureTime('');
        setArrivalTime('');
        setShowForm(false);
        fetchData();
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage('Error adding train');
    }
  };

  return (
    <>
      <Header onLogout={onLogout} />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Train className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{trains.length}</p>
                <p className="text-gray-600">Total Trains</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-gray-600">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Ticket className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{bookings.length}</p>
                <p className="text-gray-600">Total Bookings</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Manage Trains</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Train
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddTrain} className="mb-6 p-4 border rounded-md bg-gray-50">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Train Number"
                  value={trainNumber}
                  onChange={(e) => setTrainNumber(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="text"
                  placeholder="Train Name"
                  value={trainName}
                  onChange={(e) => setTrainName(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="text"
                  placeholder="Origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="text"
                  placeholder="Destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="time"
                  placeholder="Departure Time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="time"
                  placeholder="Arrival Time"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>



              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                Add Train
              </button>
            </form>
          )}

          {message && <p className="text-green-500 mb-4">{message}</p>}

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Train Number</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Train Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Origin</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Destination</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Departure</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Arrival</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Classes</th>
                </tr>
              </thead>
              <tbody>
                {trains.map((train) => (
                  <tr key={train.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{train.train_number}</td>
                    <td className="px-4 py-3 text-sm">{train.train_name}</td>
                    <td className="px-4 py-3 text-sm">{train.origin}</td>
                    <td className="px-4 py-3 text-sm">{train.destination}</td>
                    <td className="px-4 py-3 text-sm">{train.date}</td>
                    <td className="px-4 py-3 text-sm">{train.departure_time}</td>
                    <td className="px-4 py-3 text-sm">{train.arrival_time}</td>
                    <td className="px-4 py-3 text-sm">
                      {train.classes ? train.classes.map(cls => `${cls.class}-${cls.quota}`).join(', ') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Age</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Gender</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{user.id}</td>
                    <td className="px-4 py-3 text-sm">{user.name}</td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm">{user.age}</td>
                    <td className="px-4 py-3 text-sm">{user.gender}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Train</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Origin</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Destination</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Class</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Quota</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Passengers</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{booking.id}</td>
                    <td className="px-4 py-3 text-sm">{booking.user_name}</td>
                    <td className="px-4 py-3 text-sm">{booking.train_name}</td>
                    <td className="px-4 py-3 text-sm">{booking.origin}</td>
                    <td className="px-4 py-3 text-sm">{booking.destination}</td>
                    <td className="px-4 py-3 text-sm">{booking.date}</td>
                    <td className="px-4 py-3 text-sm">{booking.class}</td>
                    <td className="px-4 py-3 text-sm">{booking.quota}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{booking.passenger_ids.split(',').length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
