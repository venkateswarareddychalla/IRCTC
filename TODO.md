# TODO List for Admin Panel Enhancements

## Backend Updates
- [x] Add `/get-all-users` endpoint in `backend/server.js` to fetch all user profiles
- [x] Add `/get-all-bookings` endpoint in `backend/server.js` to fetch all bookings with train and user details

## Frontend Updates
- [x] Update `admin/src/App.jsx` to add state for users and bookings
- [x] Add fetch calls for users and bookings on component mount
- [x] Add UI sections to display users in a table
- [x] Add UI sections to display bookings in a table
- [x] Style the new tables to match the existing design

## Frontend Updates
- [x] Add a header section in admin panel to display summary info (total users, bookings, trains)

## Testing
- [ ] Test the new endpoints via API calls
- [ ] Verify data display in admin panel
- [ ] Ensure no conflicts with existing functionality
