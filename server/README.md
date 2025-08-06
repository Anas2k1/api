# Backend Server Setup

## Install dependencies
```
npm install
```

## Start the server (development with nodemon)
```
npm run dev
```

## Start the server (production)
```
npm start
```

## Environment Variables
- Edit `.env` to set your MongoDB URI and port.

## API Endpoints

### Users
- `POST /api/users/register` — Register a new user
- `GET /api/users` — Get all users

### Countries
- `POST /api/countries` — Add a country
- `POST /api/countries/visited` — Add visited country to user
- `POST /api/countries/wishlist` — Add wishlist country to user
- `GET /api/countries` — Get all countries
