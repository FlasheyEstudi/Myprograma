# ReserveNow - Restaurant Reservation System

A comprehensive restaurant reservation system built with Next.js 15, TypeScript, Prisma, and SQLite.

## 🚀 Features

### Core Functionality
- **Restaurant Management**: Browse, search, and filter restaurants by cuisine, price range, and location
- **Real-time Availability**: Check table availability for specific dates and times
- **Reservation System**: Create, manage, and cancel reservations with time slot validation
- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Review System**: Rate and review restaurants after completing reservations
- **Responsive Design**: Mobile-first design using Tailwind CSS and shadcn/ui components

### Technical Features
- **Type-safe API**: Full TypeScript implementation with Zod validation
- **Database**: SQLite with Prisma ORM for type-safe database operations
- **Authentication**: JWT tokens with refresh token support
- **Error Handling**: Comprehensive error handling with standardized API responses
- **Validation**: Input validation using Zod schemas
- **Pagination**: Efficient pagination for large datasets

## 🏗️ Architecture

### Database Schema
- **Users**: Authentication and user profiles with role-based access
- **Restaurants**: Restaurant information with operating hours and capacity
- **Tables**: Table management with capacity and features
- **Reservations**: Booking system with status tracking
- **Reviews**: Rating and review system with verification

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

#### Restaurants
- `GET /api/restaurants` - List restaurants with filtering and pagination
- `GET /api/restaurants/[id]` - Get restaurant details
- `POST /api/restaurants` - Create restaurant (admin only)
- `PUT /api/restaurants/[id]` - Update restaurant (admin only)
- `DELETE /api/restaurants/[id]` - Delete restaurant (admin only)

#### Tables
- `GET /api/tables` - List tables with optional restaurant filter
- `GET /api/tables/[id]` - Get table details
- `POST /api/tables` - Create table (admin only)
- `PUT /api/tables/[id]` - Update table (admin only)
- `DELETE /api/tables/[id]` - Delete table (admin only)

#### Reservations
- `GET /api/reservations` - List reservations (admin only)
- `GET /api/reservations/[id]` - Get reservation details
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/[id]` - Update reservation
- `DELETE /api/reservations/[id]` - Cancel reservation

#### Availability
- `GET /api/availability` - Check table availability for specific date/time

#### Reviews
- `GET /api/reviews` - List reviews with filtering
- `GET /api/reviews/[id]` - Get review details
- `POST /api/reviews` - Create review
- `PUT /api/reviews/[id]` - Update review
- `DELETE /api/reviews/[id]` - Delete review

#### User Management
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/me/reservations` - Get user's reservations

## 🛠️ Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript 5**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library
- **Lucide React**: Icon library
- **date-fns**: Date manipulation utilities

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Type-safe database access
- **SQLite**: Lightweight database
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **Zod**: Schema validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd reserve-now
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the database**
   ```bash
   npm run db:push
   ```

4. **Seed the database with sample data**
   ```bash
   npx tsx seed.ts
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Sample Login Credentials
After running the seed script, you can use these credentials:

**Admin Account:**
- Email: `admin@reservenow.com`
- Password: `Admin123!`

**User Account:**
- Email: `user@example.com`
- Password: `User123!`

### Key Features Usage

1. **Browse Restaurants**: Use the search bar and filters to find restaurants
2. **Check Availability**: Click "Check Availability" on any restaurant card
3. **Make Reservations**: Select a time slot and confirm your booking
4. **Manage Reservations**: View and cancel your reservations from your profile
5. **Leave Reviews**: Rate restaurants after completing your reservation

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── restaurants/    # Restaurant management
│   │   ├── tables/         # Table management
│   │   ├── reservations/   # Reservation system
│   │   ├── reviews/        # Review system
│   │   ├── users/          # User management
│   │   └── availability/   # Availability checking
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/ui/          # shadcn/ui components
├── lib/                    # Utility libraries
│   ├── auth.ts             # Authentication utilities
│   ├── api-response.ts     # API response helpers
│   ├── db.ts              # Prisma client
│   ├── middleware.ts      # Auth middleware
│   ├── schemas.ts         # Zod validation schemas
│   └── utils.ts           # General utilities
└── hooks/                  # React hooks
```

## 🔒 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive input validation with Zod
- **Role-Based Access**: Admin and user role separation
- **SQL Injection Prevention**: Prisma ORM provides protection
- **XSS Protection**: Built-in Next.js security headers

## 📊 Database Schema

The system uses a relational database schema with the following main entities:

- **Users**: Authentication and profile management
- **Restaurants**: Restaurant information and settings
- **Tables**: Restaurant tables with capacity and features
- **Reservations**: Booking records with status tracking
- **Reviews**: User reviews with rating system

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
- `DATABASE_URL`: SQLite database connection string
- `JWT_SECRET`: Secret for JWT token signing
- `NODE_ENV`: Environment (development/production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.