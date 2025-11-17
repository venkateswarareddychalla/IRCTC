# TODO: Implement IRCTC-like Train Addition and Booking Mechanism

## Database Restructuring
- [ ] Update `trains` table: Add `departure_time`, `arrival_time`, enforce UNIQUE on `train_number`
- [ ] Create new `train_classes` table: `id`, `train_id` (FK), `class`, `quota`, `seats_available`, `price`

## Backend Updates
- [ ] Modify `/add-train` endpoint to accept array of classes/quotas
- [ ] Update `/search-trains` to group by train with all classes/quotas
- [ ] Update `/check-availability` for class/quota selection
- [ ] Update booking endpoints (`/book-ticket`, `/confirm-booking`, `/cancel-booking`) to handle multiple classes/quotas per booking
- [ ] Update `/get-trains` for admin to include classes/quotas

## Admin Panel Updates
- [ ] Redesign "Add Train" form for dynamic multiple classes/quotas
- [ ] Update train display to group by train number with classes/quotas

## Testing and Migration
- [ ] Test train addition, search, and booking flows
- [ ] Migrate existing train data to new structure if needed
