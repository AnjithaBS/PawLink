# 🐾 PawLink — Animal Care & Rescue Platform

PawLink is a full-stack MERN application that serves two primary purposes: empowering pet owners through a dedicated support ecosystem, and driving community-led stray and wild animal rescue actions with a geographic-based **Smart Alert Routing System**.

---

## 🌟 Key Features

### 🔐 1. Authentication & Onboarding
- **JWT Session Security:** Authentication utilizes secure token layers and password hashing via `bcryptjs`.
- **Onboarding Questionnaire:** After registering or logging in, new users are immediately prompted to state if they have pets. Selecting "Yes" unlocks pet owner features, while "No" designates them as community volunteer citizens.
- **Dynamic Preference Control:** Users can change their pet preference directly from their profile at any time, instantly altering the navigation sidebar.

### 🐶 2. Pet Owner Ecosystem (hasPet = true)
- **Pet Profiles (CRUD):** Add, view, edit, and delete pet profiles, including details like name, breed, age, vaccination schedule, clinical history, and custom photos (uploaded via `multer`).
- **Nearby Support Map:** Integrates **OpenStreetMap & Leaflet** to dynamically display nearby veterinarians, pet groomers, organic food stores, and accessory shops relative to their GPS coordinates.
- **Emergency Button:** A high-visibility alert button that opens a floating emergency drawer displaying immediate hotlines.

### 🚨 3. Community Reporting & Smart Alert Routing
- **Incident Reporting:** Any registered citizen can log stray or wild animal issues (Injured, Rescue Request, Dead/Decomposed, Treatment Required, Wild Sighting) with descriptions, photo uploads, severity tiers, and contact logs.
- **GPS Coordinates Pinning:** Renders an interactive map allowing users to load their live browser GPS location or click anywhere on the map to pin coords.
- **Smart Alert Routing:** Automatically computes distances to regional authorities using the **Haversine formula** to assign the closest relevant responding organization:
  1. *Dead/Decomposed* ➔ Assigned to closest **Municipality**
  2. *Rescue Request* ➔ Assigned to closest **Fire Force** & **Animal Emergency Hospital**
  3. *Treatment Required / Injured* ➔ Assigned to closest **Veterinary Hospital**
  4. *Wild Animal Sighting* ➔ Assigned to closest **Forest Ranger Office**

### 📊 4. Real-time Communication & Admin Cockpit
- **Statistical Cards:** Renders statistics for total reports, pending alerts, in-progress issues, resolved cases, active citizens, and registered pet cards.
- **Incident Cluster Map:** Admins can view all reported incidents mapped as pins color-coded by severity, with Critical cases featuring a pulsing ping.
- **Dropdown Status Toggles:** Admins can transition report statuses (`Pending` ➔ `In Progress` ➔ `Resolved`).
- **Real-Time WebSockets:** Powered by `Socket.io`, updating the status of a report immediately pushes a slide-in Toast alert to the connected reporter.
- **Email Alerts:** Automatically triggers Nodemailer email notifications to the reporter during incidents and status progressions.

---

## 📂 Project Structure

```
PawLink/
├── public/                 # Static assets for React
├── src/                    # Frontend React Sources
│   ├── components/         # Navbar, Sidebar, Spinner, Custom Maps
│   ├── context/            # AuthContext, ToastContext, SocketContext
│   ├── pages/              # Login, Signup, Onboarding, Dashboards
│   ├── routes/             # AppRoutes routing guards
│   ├── services/           # Axios API configuration
│   ├── utils/              # Leaflet and helper scripts
│   ├── App.jsx             # Main layout entry
│   ├── index.css           # Tailwind base styles and Leaflet overrides
│   └── main.jsx            # Context wrapper bootstrap
├── server/                 # Backend Node.js / Express Source
│   ├── config/             # DB Mongoose and Nodemailer configurations
│   ├── controllers/        # Auth, Pet, Reports, Nearby and Admin logic
│   ├── middleware/         # JWT locks and Multer uploads filters
│   ├── models/             # User, Pet, AnimalReport, Authority, Notification
│   ├── routes/             # REST Router maps
│   ├── uploads/            # Multer static uploads folder
│   ├── utils/              # Mock services coordinates seed
│   ├── .env                # Server environment configurations
│   └── server.js           # Express main server launcher
├── tailwind.config.js      # Tailwind CSS brand tokens
├── postcss.config.js       # PostCSS configure
└── package.json            # Frontend package details
```

---

## ⚙️ Setup & Installation Instructions

### 🔑 Prerequisites
Ensure you have the following installed on your Linux machine:
- **Node.js** (v18 or higher recommended; fully validated on Node v24)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a remote MongoDB Atlas URI.

---

### 💻 Step-by-Step Local Launch

#### 1. Setup the Backend Server
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. The environment variables are already configured inside `server/.env`. Modify them if you want to use customized MongoDB Atlas or SMTP credentials:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/pawlink
   JWT_SECRET=pawlink_super_jwt_secret_key_2026!
   FRONTEND_URL=http://localhost:5173
   ```
3. Run the development server (runs Mongoose connection, seeds default regional authorities, and initiates Nodemailer test boxes):
   ```bash
   npm run dev
   ```

#### 2. Setup the Frontend Client
1. Open a new terminal window in the root directory `PawLink/`.
2. Launch the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to the local address displayed: `http://localhost:5173`.

---

## 🧪 Quick Demo Test Credentials

To ease your evaluation of separate dashboard modes, we have seeded standard accounts:

| Role | Email Address | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@pawlink.org` | `123456` | Directs straight to the Admin cockpit and cluster map. |
| **Pet Owner** | `owner@test.com` | `123456` | Directs to Pet Dashboard (displays pet logging and clinics map). |
| **Citizen** | `citizen@test.com` | `123456` | Directs to Citizen Volunteer dashboard (displays strays rescue guidelines). |

*Note: You can also register a brand new account and select your dashboard preference on the fly!*
