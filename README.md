# playableEcommerce

This is a small full-stack e-commerce project I built for the **Playable Factory – Software Engineer Case Study**.

The goal is to show a realistic shopping flow end-to-end:

- Browse products
- View product details
- Add to cart
- Checkout (with a simple address/payment simulation)
- See your orders and profile
- As an admin, see all orders and basic analytics

---

## Tech Stack

**Frontend**

- Next.js (App Router)
- TypeScript
- React.js
- Tailwind CSS

**Backend**

- Node.js
- Express
- MongoDB (Mongoose)
- JWT authentication (user + admin roles)

---

## Project Structure

```txt
.
├── backend/          # Express + MongoDB API
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── frontend/         # Next.js + TypeScript + Tailwind
│   └── src/
│       ├── app/
│       ├── components/
│       ├── context/
│       ├── styles/
│       └── types/
└── README.md