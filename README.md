# FBR Invoice Management Backend

A comprehensive Node.js backend application for managing FBR (Federal Board of Revenue) invoices for registered businesses in Pakistan.

## Features

- 🔐 **Secure Authentication**: JWT-based authentication with access and refresh tokens
- 👥 **User Management**: Admin-controlled user creation and management
- 📊 **Database**: PostgreSQL with Prisma ORM
- 🛡️ **Role-Based Access Control**: Admin and User roles with appropriate permissions
- 🔒 **Password Security**: Bcrypt password hashing
- ✅ **Input Validation**: Express-validator for request validation
- 🚦 **Error Handling**: Centralized error handling middleware
- 🛡️ **Rate Limiting**: DDoS protection with configurable rate limits

## Database Schema

### Users Table
- Personal Information: name, email, business name
- Location: province, address
- Identification: NTN/CNIC
- Authorization: role (ADMIN/USER), password
- FBR Tokens: post_invoice_token_test, validate_invoice_token_test, post_invoice_token, validate_invoice_token
- Status: isActive, timestamps

### HS Codes Table
- HS code with description

### Scenarios Table
- User-specific scenarios with code and description

### Products Table
- User products with description, value, value excluding sales tax, retail price

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Environment**: dotenv

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd FBR-Invoice-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   ```bash
   copy .env.example .env
   ```
   - Update the following variables in `.env`:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `JWT_SECRET`: Your JWT secret key
     - `JWT_REFRESH_SECRET`: Your refresh token secret key
     - Other configuration as needed

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # Seed the database (creates admin user)
   npm run prisma:seed
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Endpoints

#### POST /api/v1/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "name": "User Name",
      "email": "user@example.com",
      "role": "USER",
      ...
    },
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

#### POST /api/v1/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

#### POST /api/v1/auth/logout
Logout and invalidate refresh token.

**Request Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

#### GET /api/v1/auth/profile
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <access-token>
```

### User Management Endpoints (Admin Only)

All user management endpoints require authentication and ADMIN role.

**Headers:**
```
Authorization: Bearer <admin-access-token>
```

#### POST /api/v1/users
Create a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "businessName": "ABC Trading Company",
  "province": "Punjab",
  "address": "123 Main Street, Lahore",
  "ntncnic": "1234567890123",
  "password": "SecurePass@123",
  "postInvoiceTokenTest": "optional-token",
  "validateInvoiceTokenTest": "optional-token",
  "postInvoiceToken": "optional-token",
  "validateInvoiceToken": "optional-token"
}
```

#### GET /api/v1/users
Get all users with pagination and filtering.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in name, email, business name, NTN/CNIC
- `role`: Filter by role (ADMIN/USER)
- `isActive`: Filter by active status (true/false)

**Example:**
```
GET /api/v1/users?page=1&limit=10&search=john&role=USER&isActive=true
```

#### GET /api/v1/users/:id
Get user by ID.

#### PATCH /api/v1/users/:id
Update user information.

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "businessName": "Updated Business",
  "province": "Sindh",
  "address": "New Address",
  "ntncnic": "9876543210987",
  "postInvoiceToken": "new-token"
}
```

#### DELETE /api/v1/users/:id
Delete a user (cannot delete admin users).

#### PATCH /api/v1/users/:id/toggle-status
Toggle user active/inactive status.

#### PATCH /api/v1/users/:id/password
Update user password.

**Request Body:**
```json
{
  "password": "NewSecurePass@123"
}
```

## Authentication Flow

1. **Login**: User provides email and password
2. **Token Generation**: Server generates access token (24h) and refresh token (7d)
3. **API Requests**: Include access token in Authorization header
4. **Token Refresh**: Use refresh token to get new access token when expired
5. **Logout**: Invalidate refresh token

## Default Admin Credentials

After running the seed command, a default admin user is created:

- **Email**: admin@fbr.gov.pk
- **Password**: Admin@123

⚠️ **Important**: Change these credentials immediately after first login!

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&#)

## Project Structure

```
FBR-Invoice-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js                # Database seeding script
├── src/
│   ├── config/
│   │   └── index.js           # Configuration management
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   └── userController.js  # User management logic
│   ├── middleware/
│   │   ├── auth.js            # Authentication middleware
│   │   ├── errorHandler.js    # Error handling middleware
│   │   └── validator.js       # Validation middleware
│   ├── routes/
│   │   ├── authRoutes.js      # Authentication routes
│   │   └── userRoutes.js      # User management routes
│   ├── utils/
│   │   ├── errors.js          # Error utilities
│   │   ├── jwt.js             # JWT utilities
│   │   └── password.js        # Password utilities
│   ├── validators/
│   │   ├── authValidators.js  # Authentication validators
│   │   └── userValidators.js  # User validators
│   └── server.js              # Express server setup
├── .env.example               # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-reload
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed the database with initial data

## Error Handling

The application uses centralized error handling with custom error classes:

- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication errors)
- **403**: Forbidden (authorization errors)
- **404**: Not Found
- **500**: Internal Server Error

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT-based authentication
- Refresh token rotation
- Role-based access control
- Input validation and sanitization
- Protected routes
- CORS enabled
- SQL injection prevention (Prisma ORM)
- **Rate Limiting & DDoS Protection**:
  - General API: 100 requests per 15 minutes
  - Authentication: 5 requests per 15 minutes
  - User Creation: 10 requests per hour
  - Password Updates: 3 requests per hour

## Development Tools

- **Prisma Studio**: Visual database browser
  ```bash
  npm run prisma:studio
  ```

- **Morgan**: HTTP request logger (development mode)

## Future Enhancements

- Invoice management endpoints
- Product management APIs
- Scenario management APIs
- HS Code management APIs
- File upload for invoices
- Email notifications
- Audit logging
- Rate limiting
- API documentation (Swagger)

## Support

For issues or questions, please contact the development team.

## License

ISC
