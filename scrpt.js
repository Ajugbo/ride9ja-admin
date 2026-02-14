// Supabase setup
const supabase = supabase.createClient(
    'https://ryaaqozgpmuysjayomdd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YWFxb3pncG11eXNqYXlvbWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMTk5ODMsImV4cCI6MjA4NDU5NTk4M30.MOtDemq56FMUizveP1WC2KJ-2YGIwknduVsxcn8DTBc'
);

// Load all data
async function loadData() {
    try {
        const [users, trips, vehicles] = await Promise.all([
            supabase.from('users').select('*').order('created_at', { ascending: false }),
            supabase.from('trips').select('*').order('created_at', { ascending: false }),
            supabase.from('vehicles').select('*').order('created_at', { ascending: false })
        ]);

        // Update stats
        document.getElementById('totalUsers').textContent = users.data?.length || 0;
        document.getElementById('totalTrips').textContent = trips.data?.length || 0;
        document.getElementById('totalVehicles').textContent = vehicles.data?.length || 0;
        
        const revenue = trips.data?.reduce((sum, trip) => sum + (trip.fare || 0), 0) || 0;
        document.getElementById('totalRevenue').textContent = `₦${revenue.toLocaleString()}`;

        // Fill tables
        displayUsers(users.data || []);
        displayTrips(trips.data || []);
        displayVehicles(vehicles.data || []);
        
        // Fill recent items
        displayRecent(users.data || [], trips.data || []);

    } catch (error) {
        console.error('Error:', error);
    }
}

function displayUsers(users) {
    const tbody = document.getElementById('usersTable');
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name || 'N/A'}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td><span class="status-badge ${user.role === 'DRIVER' ? 'badge-green' : 'badge-blue'}">${user.role || 'RIDER'}</span></td>
            <td>${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
        </tr>
    `).join('');
}

function displayTrips(trips) {
    const tbody = document.getElementById('tripsTable');
    if (trips.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No trips found</td></tr>';
        return;
    }

    tbody.innerHTML = trips.map(trip => `
        <tr>
            <td>${trip.origin || 'N/A'}</td>
            <td>${trip.destination || 'N/A'}</td>
            <td>₦${trip.fare || 0}</td>
            <td><span class="status-badge badge-blue">${trip.status || 'REQUESTED'}</span></td>
            <td>${trip.created_at ? new Date(trip.created_at).toLocaleDateString() : 'N/A'}</td>
        </tr>
    `).join('');
}

function displayVehicles(vehicles) {
    const tbody = document.getElementById('vehiclesTable');
    if (vehicles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No vehicles found</td></tr>';
        return;
    }

    tbody.innerHTML = vehicles.map(vehicle => `
        <tr>
            <td>${vehicle.make || 'N/A'}</td>
            <td>${vehicle.model || 'N/A'}</td>
            <td>${vehicle.plate_number || 'N/A'}</td>
            <td>${vehicle.driver_id?.substring(0, 8) || 'N/A'}...</td>
            <td><span class="status-badge ${vehicle.verified ? 'badge-green' : 'badge-orange'}">${vehicle.verified ? 'VERIFIED' : 'PENDING'}</span></td>
        </tr>
    `).join('');
}

function displayRecent(users, trips) {
    // Recent trips
    const recentTrips = trips.slice(0, 5).map(trip => `
        <div class="recent-item">
            <span>${trip.origin || 'N/A'} → ${trip.destination || 'N/A'}</span>
            <span>₦${trip.fare || 0}</span>
        </div>
    `).join('');
    document.getElementById('recentTrips').innerHTML = recentTrips || '<p>
