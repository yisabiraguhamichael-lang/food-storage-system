# React dashboard
Run `start.bat` from the project folder to start both servers and open the app.

To start the frontend manually, run in Windows CMD:
```bat
copy .env.example .env
npm install
npm run dev
```
Open http://localhost:5173. Register or log in there; after a successful login, the app opens the dashboard at `/dashboard`. Use **Log out** in the dashboard to return to login. The dashboard refreshes API data every 3 seconds. The backend and PostgreSQL database must also be running for registration, login, inventory, and sensor data to work. The backend API runs at http://localhost:5000 and does not serve the frontend pages.