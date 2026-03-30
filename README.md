# NeuroRide — AI Powered  Ride-Sharing Platform

A full-stack AI powered ride-sharing platform with real-time driver matching, live ride tracking via WebSockets, dynamic pricing, and an admin dashboard for fleet and payment management.

> **Demo:** https://www.loom.com/share/10cc465c74d4425b834dbe1757acf76e 

---

## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)

---

## Features

### Rider
- Book rides with real-time driver matching based on pickup location
- Live ride tracking with sub-second position updates via WebSockets
- Dynamic fare estimation using Google Maps Distance Matrix API
- In-app payment processing via Razorpay (test mode)
- Ride history and rating submission

### Driver
- Accept/reject ride requests in real-time
- Automated earnings settlement via Razorpay payouts
- Location updates pushed to riders via WebSocket channel
- View ride history and earnings dashboard

### Admin
- Dashboard with ride analytics, total revenue, active rides, and user stats
- User management — view, block/unblock users, verify drivers
- Ride management — access ride details, update driver balance post-payment
- Payment monitoring — track completed and pending transactions
- Fraud detection — real-time anomaly logging and admin alerts

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│         Next.js (SSR) + Google Maps + Socket.IO         │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API + WebSocket
┌──────────────────────▼──────────────────────────────────┐
│                    Backend (Node.js)                    │
│         Express.js + Socket.IO + JWT Auth + RBAC        │
│              Rate Limiting + Redis Pub/Sub               │
└──────┬───────────────┬────────────────┬────────┬────────┘
       │               │                │        │
┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│   MongoDB   │ │    Redis    │ │  Razorpay   │ │   FastAPI   │
│  (Primary)  │ │  (Cache +   │ │  (Payments) │ │  Matching   │
│             │ │  Pub/Sub)   │ │             │ │ Microservice│
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

**Key Design Decisions:**
- **FastAPI microservice** for driver-rider matching — separated from the Node.js backend so the matching algorithm can evolve into an ML model independently without touching core business logic. Uvicorn handles async requests for low-latency location-based computations
- **Redis Pub/Sub** for distributing real-time events across backend instances — prevents WebSocket bottlenecks under load
- **MongoDB** chosen for flexible, schema-less ride and user data that evolves with features
- **JWT with refresh tokens** for stateless auth with secure session management
- **Dynamic pricing** calculated server-side using Google Maps Distance Matrix API based on distance and vehicle type — not client-side to prevent manipulation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, Tailwind CSS, Google Maps API |
| Backend | Node.js, Express.js |
| Matching Microservice | FastAPI, Uvicorn (Python) |
| Real-Time | Socket.IO, Redis Pub/Sub |
| Database | MongoDB (Cloud), Redis |
| Auth | JWT, bcryptjs, RBAC |
| Payments | Razorpay |
| DevOps | Docker, GitHub Actions (CI/CD), Nginx |
| Deployment | Vercel (Frontend), Render/GCP (Backend) |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | User signup |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Fetch user profile |
| PUT | `/api/auth/profile` | Update user profile |

### Ride Management
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ride/request` | Book a ride |
| POST | `/api/ride/accept` | Driver accepts ride |
| POST | `/api/ride/start` | Start ride |
| POST | `/api/ride/complete` | Mark ride as complete |
| POST | `/api/ride/cancel` | Cancel ride |
| POST | `/api/ride/rate` | Submit rating |
| GET | `/api/ride/status/:id` | Fetch ride status |
| GET | `/api/ride/user/:id` | Fetch user rides |
| GET | `/api/ride/driver/:driverId/rides` | Fetch driver rides |
| POST | `/api/ride/distance` | Fetch distance and duration |

### Payments & Pricing
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payment/charge` | Process ride payment |
| POST | `/api/payment/update` | Update payment status |
| GET | `/api/payment/estimate` | Get fare estimate |

### Real-Time (WebSocket)
| Channel | Description |
|---|---|
| `ws://[host]/ws/track/:driver_id` | Live driver tracking channel |
| GET `/api/driver/location/:driver_id` | Fetch driver's current location |
| POST `/api/driver/update-location` | Push driver location update |
| GET `/api/ride/:ride_id/driver-location` | Fetch updated driver location for a ride |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | All system users |
| PATCH | `/api/admin/users/:id/status` | Toggle user active status |
| PATCH | `/api/admin/verify/:id` | Verify a driver |
| GET | `/api/admin/rides` | All rides |
| POST | `/api/admin/update-driver-balance` | Update driver balance |
| GET | `/api/admin/payments/:driverId/:rideId` | Payments for specific ride |

## Screenshots

![Landing Page] (./screenshots/admin.png)
![Admin Dashboard]((./screenshots/neuroride.webp)


---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Redis
- Razorpay account (test mode)
- Google Maps API key

### Installation

```bash
# Clone the repository
git clone https://github.com/diwakarworks/neuroride.git
cd neuroride

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Running Locally

```bash
# Start backend
cd server
npm run dev

# Start frontend
cd client
npm run dev
```

---

## Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render / GCP |
| Database | MongoDB Atlas |
| Cache | Redis Cloud |
| Containerization | Docker |
| CI/CD | GitHub Actions |

---

## Future Enhancements

- **Voice-Based Booking** — ride booking via voice commands
- **Predictive Demand Analysis** — AI-powered surge zone prediction
- **Kubernetes Scaling** — container orchestration for high-concurrency deployments
- **Blockchain Payments** — decentralized, tamper-proof payment processing

---

## Author

**Diwakar G** — [Portfolio](https://my-portfolio-ten-sandy-76.vercel.app) | [LinkedIn](https://www.linkedin.com/in/diwakar-6719b0213) | [GitHub](https://github.com/diwakarworks)
