# Hike Tracker 🥾

**Hike Tracker** is a Progressive Web App (PWA) built with React that lets users record their hiking adventures. It uses device hardware features such as **GPS** (via the Geolocation API) and the **camera** (via the Camera API with `react-webcam`) to create an interactive hiking experience.

## 🌟 Features

- ✅ Start and stop hikes
- 🗺️ Track real-time location on a map
- 📸 Take photos during hikes (pinned to map)
- 📊 View hike summary with distance and duration
- 📂 View and dekete previous hikes
- 📱 Installable as a PWA

## 🚀 Live App

Access the live app here: [https://hike-tracker-omega.vercel.app](https://hike-tracker-omega.vercel.app)

To install the PWA:
- On desktop: Click the "Install App" button in the browser address bar.
- On mobile: Open the browser menu and select **Add to Home Screen**.

---

## 🧰 Technologies Used

- **React** (Frontend)
- **Dexie.js** (IndexedDB wrapper for local storage)
- **Leaflet.js** (Map rendering)
- **react-webcam** (Camera integration)
- **Vite** (Development & build tooling)

---

## 📸 Permissions Required

- **Location Access** – Used to track the user’s route on a map.
- **Camera Access** – Used to capture photos during hikes.

These permissions are only requested when required and are never stored beyond the device.

---

## 🛠️ Getting Started Locally

Clone the repository and run the app locally:

```bash
git clone https://github.com/chrisdolan87/HikeTracker.git
cd HikeTracker
npm install
npm run dev
Then visit [http://localhost:5173](http://localhost:5173) in your browser.
```

**Note:** This project uses **Vite**. If `npm run dev` doesn’t work, make sure Vite is properly installed.

---

## 📂 Folder Structure Overview

src/
│
├── components/        # React components (MapView, Camera, Summary, etc.)
├── db/                # Dexie.js setup for IndexedDB
├── pages/             # Page-level components (Home, Hike, PreviousHikes)
├── utils/             # Utility functions (distance, time calculation)
├── App.jsx            # Main app logic
├── main.jsx           # App entry point

---

## 🧪 Known Issues

- Some devices block camera access in incognito/private browsing modes.
- Location tracking depends on GPS accuracy and may be less reliable in areas with poor signal.
- No current export function for hike data (planned for future).

---

## 🔮 Future Improvements

- Offline map caching for better hiking in remote areas
- Export hikes to GPX/KML
- Photo gallery with full-size image previews
- Enhanced analytics for elevation and pace

---

## 📘 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 🙌 Credits

Built by **Chris Dolan**.

Icons and assets from:

- [Leaflet](https://leafletjs.com/)
- [Font Awesome](https://fontawesome.com/)
- [Heroicons](https://heroicons.com/)