import { useState, useEffect } from 'react'
import { Check, CheckCircle, Plus, Train, Users, Ticket } from 'lucide-react'

function App() {
  const [showForm, setShowForm] = useState(false);
  const [trainNumber, setTrainNumber] = useState('');
  const [trainName, setTrainName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [trainClass, setTrainClass] = useState('');
  const [quota, setQuota] = useState('');
  const [seatsAvailable, setSeatsAvailable] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [trains, setTrains] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const res = await fetch('http://localhost:3000/get-trains');
        const data = await res.json();
        if (data.success) {
          setTrains(data.trains);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTrains();

    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:3000/get-all-users');
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();

    const fetchBookings = async () => {
      try {
        const res = await fetch('http://localhost:3000/get-all-bookings');
        const data = await res.json();
        if (data.success) {
          setBookings(data.bookings);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBookings();
  }, []);

  const handleAddTrain = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/add-train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ train_number: trainNumber, train_name: trainName, origin, destination, date, class: trainClass, quota, seats_available: parseInt(seatsAvailable), price: parseFloat(price) }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Train added successfully');
        setTrainNumber('');
        setTrainName('');
        setOrigin('');
        setDestination('');
        setDate('');
        setTrainClass('');
        setQuota('');
        setSeatsAvailable('');
        setPrice('');
        setShowForm(false);
        // Refresh trains list
        const res2 = await fetch('http://localhost:3000/get-trains');
        const data2 = await res2.json();
        if (data2.success) {
          setTrains(data2.trains);
        }
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white p-6 sm:p-8 lg:p-10 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">Admin Panel - Train Management</h1>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-md text-center">
            <div className="flex items-center justify-center mb-4">
              <Train className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Total Trains</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{trains.length}</p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-md text-center">
            <div className="flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Total Users</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{users.length}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200 shadow-md text-center">
            <div className="flex items-center justify-center mb-4">
              <Ticket className="w-8 h-8 text-orange-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">Total Bookings</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">{bookings.length}</p>
          </div>
        </div>

        {!showForm && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-8 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center mx-auto"
            >
              <Plus className="w-6 h-6 mr-3" />
              Add New Train
            </button>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleAddTrain} className="mb-10 bg-gradient-to-r from-gray-50 to-blue-50 p-6 sm:p-8 rounded-xl border border-gray-300 shadow-md">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Train className="w-7 h-7 mr-3 text-blue-600" />
              Add New Train
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <input
              type="text"
              placeholder="Train Number"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
            />
            <input
              type="text"
              placeholder="Train Name"
              value={trainName}
              onChange={(e) => setTrainName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
            />
            <input
              type="text"
              placeholder="Origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
            />
            <input
              type="text"
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
            />
            <input
              type="date"
              placeholder="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
            />
            <select
              value={trainClass}
              onChange={(e) => setTrainClass(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <option value="">Select Class</option>
              <option value="1A">1A - First AC</option>
              <option value="2A">2A - Second AC</option>
              <option value="3A">3A - Third AC</option>
              <option value="SL">SL - Sleeper</option>
              <option value="CC">CC - Chair Car</option>
              <option value="2S">2S - Second Sitting</option>
            </select>
            <select
              value={quota}
              onChange={(e) => setQuota(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <option value="">Select Quota</option>
              <option value="GN">GN - General</option>
              <option value="TQ">TQ - Tatkal</option>
              <option value="PT">PT - Premium Tatkal</option>
              <option value="LD">LD - Ladies</option>
              <option value="HP">HP - Physically Handicapped</option>
            </select>
            <input
              type="number"
              placeholder="Seats Available"
              value={seatsAvailable}
              onChange={(e) => setSeatsAvailable(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
            />
          </div>
          <div className="flex gap-4 mt-8">
            <button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Add Train
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
            >
              Cancel
            </button>
          </div>
        </form>
        )}
        {message && (
          <div className="mb-8 p-5 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-400 text-green-800 rounded-xl shadow-md">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
              {message}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 sm:p-8 rounded-xl border border-purple-200 shadow-md">
          <h3 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-8 flex items-center">
            <CheckCircle className="w-8 h-8 mr-3 text-purple-600" />
            All Available Trains
          </h3>
          {trains.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {trains.map((train) => (
                <div key={train.id} className="bg-white border border-gray-300 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">{train.train_number.slice(0, 2)}</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">{train.train_name} ({train.train_number})</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Origin:</span>
                      <span className="text-gray-800">{train.origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Destination:</span>
                      <span className="text-gray-800">{train.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Date:</span>
                      <span className="text-gray-800">{train.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Class:</span>
                      <span className="text-gray-800">{train.class}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Quota:</span>
                      <span className="text-gray-800">{train.quota}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Seats:</span>
                      <span className="text-gray-800">{train.seats_available}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span className="text-gray-700">Price:</span>
                      <span className="text-green-600">₹{train.fare}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No trains available.</p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 sm:p-8 rounded-xl border border-green-200 shadow-md mt-8">
          <h3 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-8 flex items-center">
            <Users className="w-8 h-8 mr-3 text-green-600" />
            All User Profiles
          </h3>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                <thead className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Age</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Gender</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Berth Preference</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-800">{user.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{user.age}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{user.gender}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{user.berth_preference || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No users found.</p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 sm:p-8 rounded-xl border border-orange-200 shadow-md mt-8">
          <h3 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-8 flex items-center">
            <Ticket className="w-8 h-8 mr-3 text-orange-600" />
            All Booked Train Tickets
          </h3>
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                <thead className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Booking ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">User Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">User Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Train Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Train Number</th>
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
                    <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-800">{booking.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{booking.user_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{booking.user_email}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{booking.train_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{booking.train_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{booking.origin}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{booking.destination}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{booking.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{booking.class}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{booking.quota}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">{booking.passenger_ids.split(',').length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No bookings found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
