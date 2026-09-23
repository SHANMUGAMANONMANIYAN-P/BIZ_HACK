# Community Help Hub 🤝

> **PS58 – Community Help Request Platform**  
> **Team:** Neon Nexus  
> **Architecture:** 100% Software Full-Stack Web Application (React + Node.js + Express + MongoDB)  
> **Philosophy:** Zero AI • Zero Blockchain • Zero Credits/Currency • Pure Coordinated Community Action  

---

## 📌 Executive Summary

**Community Help Hub** is a full-stack community assistance platform that enables people to request and provide help through focused **Help Circles**. Unlike basic request-and-response boards, it supports **multi-helper coordination**, **transparent assistance timelines**, **two-sided completion verification**, and a **contribution passport** that verifiable records community participation.

---

## 🌟 6 Core Differentiating Novelties

### 1. Help Circles
Instead of an overwhelming, unorganized global feed, requests are scoped to focused communities called **Help Circles** (e.g., *CSE Students*, *College Volunteers*, *Hostel Community*, *ECE Students*). Members can discover requests relevant to their immediate circle or choose to post globally.

### 2. Multi-Helper Capacity ($1 \to N$ Volunteers)
Traditional platforms assume 1 task = 1 helper. Community Help Hub allows requesters to specify **Required Helpers: $N$** (e.g., 5 volunteers for college event setup). The platform tracks confirmed slots in real-time ($1/5, 2/5 \dots 5/5$) and caps enrollment once capacity is reached.

### 3. Coordinated Assistance Board
Requesters manage volunteers through an interactive coordination board showing each helper's live status (`Pending`, `Accepted`, `In Progress`, `Completed`, `Rejected`), availability, and direct profile links.

### 4. Two-Sided Verified Assistance Lifecycle
No single user can unilaterally mark a request finished. We implement a strict two-sided verification protocol:
1. **Helper Action:** Helper clicks **"Mark Assistance Completed"**
2. **Requester Action:** Requester verifies and clicks **"Confirm Completion"**
3. Once all required helpers are verified, the request transitions automatically to **`ASSISTED`** and can be **`CLOSED`**.
Every transition is permanently logged in an immutable **Request History Timeline**.

### 5. Contribution Passport
A verifiable, transparent activity profile that celebrates genuine participation without fictional coins, credits, or money:
- **Help Provided Count**
- **Help Received Count**
- **Tasks Closed Count**
- **Group Activities Count**
- **Verified Successful Assists Count**
- **Registered Skills Inventory**
- **Chronological Verified Activity Stream**

### 6. Transparent Rule-Based Discovery (Zero AI)
Rather than unexplainable black-box algorithms, request relevance is computed via deterministic, explainable rules:
- **Same Help Circle Membership**
- **Matching Registered Skills**
- **Department Proximity**
- **Location Matching**
Each card explicitly displays why it is relevant (e.g., *"Because you belong to College Volunteers Circle and your department matches"*).

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, React Router v6, Axios |
| **Backend** | Node.js, Express.js, JWT, bcryptjs, Morgan, CORS |
| **Database** | MongoDB, Mongoose *(with seamless embedded In-Memory fallback for zero-dependency hackathon testing!)* |
| **Security** | Role-Based Access Control, JWT Bearer Tokens, Bcrypt Password Hashing, Input Sanitization |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) & npm

### 1. Installation
Install all backend and frontend dependencies:
```bash
# In the root directory:
npm run install:all
```
*(Or navigate into `server` and `client` individually and run `npm install`)*

### 2. Seed Demo Dataset
Pre-populate 8 realistic users, 4 Help Circles, 10 requests, sample offers, and verified history:
```bash
npm run seed
```

### 3. Start the Application
In two terminal tabs:

**Terminal 1 (Backend Server):**
```bash
npm run server
# Server boots on http://localhost:5000 (with auto in-memory mongo or local mongo)
```

**Terminal 2 (Frontend Client):**
```bash
npm run client
# Client opens on http://localhost:5173
```

---

## 🎭 1-Click Demo Login Personas for Hackathon Judges

The application includes 1-click quick login buttons on the `/login` page and in the top navigation bar:

| Persona | Email | Password | Role & Demo Purpose |
| :--- | :--- | :--- | :--- |
| **Sathesh V** | `sathesh@example.com` | `password123` | **Requester Role** (Posted 5-volunteer request, coordinates helpers) |
| **Tharun R** | `tharun@example.com` | `password123` | **Helper 1** (Offers help, marks assistance completed) |
| **Priya S** | `priya@example.com` | `password123` | **Helper 2 / Peer** (Assisted Sathesh with C++ in past) |
| **Admin User** | `admin@communityhub.org` | `password123` | **Administrator** (View analytics, suspend users, resolve reports) |

---

## 🧪 7-Step Hackathon Demo Scenario

You can execute the entire live demo through the UI in under 2 minutes:

1. **Step 1:** Log in as **Sathesh V** (`sathesh@example.com`). Click **"Request Help"**, post *"Need 5 volunteers for college event setup"* in the *College Volunteers* Circle with 5 required helpers. Status starts as `OPEN`.
2. **Step 2:** Click **"Switch Demo Role"** $\to$ select **Tharun R** (`tharun@example.com`). Open **Explore**, filter by *College Volunteers*, open the request, and click **"Offer Help Now"**.
3. **Step 3:** Switch back to **Sathesh V**. Open the request, see Tharun's offer in the **Helper Coordination Board**, and click **"Accept Helper"**. The slot counter becomes `1 / 5 Confirmed` and status transitions to `ACCEPTED`.
4. **Step 4:** Click **"Start Assistance"** to transition the request to `IN PROGRESS`.
5. **Step 5 (Two-Sided Verification):** Switch to **Tharun R**. On the request page, click **"Mark Assistance Completed"**. Switch back to **Sathesh V**, review, and click **"Confirm Completion ✓"**. The status becomes `ASSISTED`.
6. **Step 6:** Sathesh clicks **"Close Request"** $\to$ request becomes `CLOSED`.
7. **Step 7:** Open Tharun or Sathesh's **Contribution Passport** (`/profile`) to view the verified activity record, successful assists counter, and updated history.

---

## 📡 REST API Summary

### Authentication & Passport
- `POST /api/auth/register` - Register user with skills & department
- `POST /api/auth/login` - Authenticate user & issue JWT
- `GET /api/auth/me` - Get current user profile
- `GET /api/auth/passport/:id?` - Retrieve verified Contribution Passport

### Requests & Discovery
- `GET /api/requests` - Search & multi-facet filtering
- `GET /api/requests/relevant` - Transparent rule-based discovery
- `POST /api/requests` - Create help request
- `GET /api/requests/:id` - Full request details, timeline, and offers
- `PATCH /api/requests/:id/status` - Strict state transitions (`OPEN` $\to$ `ACCEPTED` $\to$ `IN PROGRESS` $\to$ `ASSISTED` $\to$ `CLOSED`)

### Multi-Helper Coordination & Verification
- `POST /api/requests/:id/offers` - Submit help offer
- `PATCH /api/offers/:id/accept` - Requester accepts helper (slot capacity enforced)
- `PATCH /api/offers/:id/reject` - Decline offer
- `PATCH /api/offers/:id/complete` - Helper marks assistance complete (Side 1)
- `PATCH /api/offers/:id/confirm` - Requester verifies & confirms completion (Side 2)

### Help Circles
- `GET /api/circles` - List all circles with active request counts
- `POST /api/circles` - Create a new circle
- `GET /api/circles/:id` - Circle details & scoped request feed
- `POST /api/circles/:id/join` - Join circle
- `DELETE /api/circles/:id/leave` - Leave circle

### Admin & Trust
- `GET /api/admin/stats` - Live platform analytics
- `GET /api/admin/users` - User directory
- `PATCH /api/admin/users/:id/suspend` - Suspend/reinstate user
- `POST /api/reports` - Submit report
- `GET /api/admin/reports` - Moderation queue
- `PATCH /api/admin/reports/:id/resolve` - Resolve report
1. User Login

Users can securely log in to the Community Help Hub using their email address and password.
<img width="1917" height="971" alt="image" src="https://github.com/user-attachments/assets/08f4095a-ca87-4f2e-bfa2-1bbc06a1cfd8" />

2. Create a Help Request

The requester can create a new help request by providing the request title, detailed description, category, Help Circle, number of required helpers, urgency level, location, date, and time.
<img width="1911" height="963" alt="image" src="https://github.com/user-attachments/assets/b8fa6236-9f25-44df-b687-5bf380463547" />

3. Fill Help Request Details

The requester enters the required information and specifies how many helpers are needed for the task.
<img width="1911" height="975" alt="image" src="https://github.com/user-attachments/assets/989c9582-eca1-4350-9086-b6ac5de83f83" />

4. Published Help Request

After publishing, the request is displayed with important information such as the requester, location, required date and time, urgency, and number of available helper slots.
<img width="1917" height="967" alt="image" src="https://github.com/user-attachments/assets/03ac709c-4a34-49aa-a14b-126ff54489db" />

5. Explore Community Requests

Helpers can browse available community requests and use search, category, Help Circle, urgency, and open-slot filters to find suitable opportunities.
<img width="1917" height="975" alt="image" src="https://github.com/user-attachments/assets/f1b95388-3a63-490d-9a18-04557ed1c5ac" />

6. Offer Help

A helper can open a request and choose **Offer Help Now** to volunteer for the task.
<img width="1917" height="967" alt="image" src="https://github.com/user-attachments/assets/b29c6f3c-4667-4e34-9df3-8e663d35587d" />

7. Submit Help Offer

The helper provides a message along with their available date and time before submitting the help offer.
<img width="1917" height="971" alt="image" src="https://github.com/user-attachments/assets/a82b2ac7-1cd8-484b-a312-db2a301f0fc3" />

8. Help Offer Submitted

After submission, the requester can see that the helper has submitted an active pending offer.
<img width="1916" height="972" alt="image" src="https://github.com/user-attachments/assets/83afb22e-5775-4415-bd8c-33227eadcfdf" />

9. Requester Reviews Helper

The requester can review the helper's profile, availability, skills, and message. The requester can either accept or reject the help offer.
<img width="1917" height="977" alt="image" src="https://github.com/user-attachments/assets/b2c88c79-d0b7-444c-8cb1-c1bd92e04328" />

10. Helper Accepted

Once accepted, the helper becomes a confirmed participant. The system updates the helper slot count and displays the assistance status.
<img width="1917" height="956" alt="image" src="https://github.com/user-attachments/assets/d8c3b842-5b4f-439b-8149-cad3a5f61706" />

---

*Built with ❤️ for the Hackathon by Team **Neon Nexus** (PS58)*
