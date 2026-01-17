# FBR Invoice Management API Documentation

**Base URL**: `http://localhost:5000/api/v1`

**Last Updated**: January 17, 2026

---

## Table of Contents
- [Rate Limiting](#rate-limiting)
- [Authentication APIs](#authentication-apis)
  - [Login](#1-login)
  - [Refresh Token](#2-refresh-token)
  - [Logout](#3-logout)
  - [Get Profile](#4-get-profile)
- [User Management APIs (Admin Only)](#user-management-apis-admin-only)
  - [Create User](#1-create-user)
  - [Get All Users](#2-get-all-users)
  - [Get User by ID](#3-get-user-by-id)
  - [Update User](#4-update-user)
  - [Delete User](#5-delete-user)
  - [Toggle User Status](#6-toggle-user-status)
  - [Update User Password](#7-update-user-password)
- [Buyer Management APIs](#buyer-management-apis)
  - [Create Buyer](#1-create-buyer)
  - [Get All Buyers](#2-get-all-buyers)
  - [Get Buyer by ID](#3-get-buyer-by-id)
  - [Update Buyer](#4-update-buyer)
  - [Delete Buyer](#5-delete-buyer)
- [HS Code Management APIs](#hs-code-management-apis)
  - [Create HS Code](#1-create-hs-code)
  - [Get All HS Codes](#2-get-all-hs-codes)
  - [Get HS Code by ID](#3-get-hs-code-by-id)
  - [Update HS Code](#4-update-hs-code)
  - [Delete HS Code](#5-delete-hs-code)
- [Scenario Management APIs](#scenario-management-apis)
  - [Create Scenario](#1-create-scenario)
  - [Get All Scenarios](#2-get-all-scenarios)
  - [Get Scenario by ID](#3-get-scenario-by-id)
  - [Update Scenario](#4-update-scenario)
  - [Delete Scenario](#5-delete-scenario)
  - [Admin Scenario Management APIs](#admin-scenario-management-apis)
- [Invoice Management APIs](#invoice-management-apis)
  - [Post Invoice to FBR](#1-post-invoice-to-fbr)
  - [Validate Invoice with FBR](#2-validate-invoice-with-fbr)
  - [Get User Invoices](#3-get-user-invoices)
  - [Get Invoice by ID](#4-get-invoice-by-id)
  - [Delete Invoice](#5-delete-invoice)
- [Error Responses](#error-responses)

---

## Rate Limiting

**DDoS Protection**: All API endpoints are protected with rate limiting to prevent abuse and DDoS attacks.

### Rate Limit Tiers

| Endpoint Type | Limit | Window | Response Headers |
|--------------|-------|--------|------------------|
| **General API** | 100 requests | 15 minutes | `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` |
| **Authentication** (login, refresh) | 5 requests | 15 minutes | `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` |
| **User Creation** | 10 requests | 1 hour | `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` |
| **Password Update** | 3 requests | 1 hour | `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` |

### Rate Limit Headers

Every response includes rate limit information in headers:

```
RateLimit-Limit: 100          # Maximum requests allowed
RateLimit-Remaining: 95       # Remaining requests in current window
RateLimit-Reset: 1705251600   # Unix timestamp when limit resets
```

### Rate Limit Exceeded Response

**Status Code**: 429 Too Many Requests

**Response**:
```json
{
  "status": "fail",
  "message": "Too many requests from this IP, please try again later."
}
```

**For Authentication Endpoints**:
```json
{
  "status": "fail",
  "message": "Too many authentication attempts, please try again after 15 minutes."
}
```

**For User Creation**:
```json
{
  "status": "fail",
  "message": "Too many user creation attempts, please try again later."
}
```

**For Password Updates**:
```json
{
  "status": "fail",
  "message": "Too many password change attempts, please try again after an hour."
}
```

---

## Authentication APIs

### 1. Login

Login with email and password to get access and refresh tokens.

**Endpoint**: `POST /auth/login`

**Rate Limit**: 5 requests per 15 minutes per IP

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "admin@fbr.gov.pk",
  "password": "Admin@123"
}
```

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@fbr.gov.pk\",\"password\":\"Admin@123\"}"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Xenax_33",
      "email": "admin@fbr.gov.pk",
      "businessName": "FBR Admin",
      "province": "Islamabad Capital Territory",
      "address": "Constitution Avenue, Islamabad",
      "ntncnic": "1234567890123",
      "role": "ADMIN",
      "postInvoiceTokenTest": null,
      "validateInvoiceTokenTest": null,
      "postInvoiceToken": null,
      "validateInvoiceToken": null,
      "isActive": true,
      "createdAt": "2026-01-14T15:30:00.000Z",
      "updatedAt": "2026-01-14T15:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:

**400 Bad Request** - Validation Error:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "[{\"field\":\"email\",\"message\":\"Please provide a valid email\"}]"
}
```

**401 Unauthorized** - Invalid Credentials:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Invalid email or password"
}
```

---

### 2. Refresh Token

Get a new access token using a refresh token.

**Endpoint**: `POST /auth/refresh`

**Rate Limit**: 5 requests per 15 minutes per IP

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"YOUR_REFRESH_TOKEN\"}"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:

**400 Bad Request** - Missing Token:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "Refresh token is required"
}
```

**401 Unauthorized** - Invalid/Expired Token:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Invalid or expired refresh token"
}
```

---

### 3. Logout

Logout and invalidate the refresh token.

**Endpoint**: `POST /auth/logout`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"YOUR_REFRESH_TOKEN\"}"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

### 4. Get Profile

Get the current authenticated user's profile.

**Endpoint**: `GET /auth/profile`

**Headers**:
```
Authorization: Bearer <access-token>
```

**cURL Request**:
```bash
curl -X GET http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Xenax_33",
      "email": "admin@fbr.gov.pk",
      "businessName": "FBR Admin",
      "province": "Islamabad Capital Territory",
      "address": "Constitution Avenue, Islamabad",
      "ntncnic": "1234567890123",
      "role": "ADMIN",
      "postInvoiceTokenTest": null,
      "validateInvoiceTokenTest": null,
      "postInvoiceToken": null,
      "validateInvoiceToken": null,
      "isActive": true,
      "createdAt": "2026-01-14T15:30:00.000Z",
      "updatedAt": "2026-01-14T15:30:00.000Z"
    }
  }
}
```

**Error Responses**:

**401 Unauthorized** - Missing Token:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**401 Unauthorized** - Invalid Token:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Invalid or expired token"
}
```

**404 Not Found** - User Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "User not found"
}
```

---

## User Management APIs (Admin Only)

All user management endpoints require:
- **Authentication**: Valid access token
- **Authorization**: ADMIN role

**Required Header**:
```
Authorization: Bearer <admin-access-token>
```

---

### 1. Create User

Create a new user (Admin only).

**Endpoint**: `POST /users`

**Rate Limit**: 10 requests per hour per IP

**Headers**:
```
Authorization: Bearer <admin-access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "businessName": "ABC Trading Company",
  "province": "Punjab",
  "address": "123 Main Street, Lahore, Pakistan",
  "ntncnic": "3520212345678",
  "password": "SecurePass@123",
  "postInvoiceTokenTest": "test_token_123",
  "validateInvoiceTokenTest": "validate_test_token_456",
  "postInvoiceToken": "prod_token_789",
  "validateInvoiceToken": "validate_prod_token_012"
}
```

**Note**: All FBR token fields are optional. Only include them if you have the tokens.

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john.doe@example.com\",\"businessName\":\"ABC Trading Company\",\"province\":\"Punjab\",\"address\":\"123 Main Street, Lahore\",\"ntncnic\":\"3520212345678\",\"password\":\"SecurePass@123\"}"
```

**Success Response (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "businessName": "ABC Trading Company",
      "province": "Punjab",
      "address": "123 Main Street, Lahore, Pakistan",
      "ntncnic": "3520212345678",
      "role": "USER",
      "postInvoiceTokenTest": "test_token_123",
      "validateInvoiceTokenTest": "validate_test_token_456",
      "postInvoiceToken": "prod_token_789",
      "validateInvoiceToken": "validate_prod_token_012",
      "isActive": true,
      "createdAt": "2026-01-14T16:00:00.000Z",
      "updatedAt": "2026-01-14T16:00:00.000Z"
    }
  }
}
```

**Error Responses**:

**400 Bad Request** - Validation Error:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "[{\"field\":\"email\",\"message\":\"Please provide a valid email\"},{\"field\":\"password\",\"message\":\"Password must be at least 8 characters long\"}]"
}
```

**400 Bad Request** - Duplicate User:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "User with this email or NTN/CNIC already exists"
}
```

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**403 Forbidden** - Not Admin:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 403
  },
  "message": "You do not have permission to perform this action"
}
```

---

### 2. Get All Users

Get a paginated list of all users with optional filtering.

**Endpoint**: `GET /users`

**Headers**:
```
Authorization: Bearer <admin-access-token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in name, email, business name, or NTN/CNIC
- `role` (optional): Filter by role (ADMIN or USER)
- `isActive` (optional): Filter by active status (true or false)

**cURL Request**:
```bash
# Get all users (page 1, 10 per page)
curl -X GET "http://localhost:5000/api/v1/users" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"

# With pagination
curl -X GET "http://localhost:5000/api/v1/users?page=2&limit=20" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"

# With search
curl -X GET "http://localhost:5000/api/v1/users?search=john" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"

# Filter by role and status
curl -X GET "http://localhost:5000/api/v1/users?role=USER&isActive=true" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"

# Combined filters
curl -X GET "http://localhost:5000/api/v1/users?page=1&limit=5&search=trading&role=USER&isActive=true" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Xenax_33",
        "email": "admin@fbr.gov.pk",
        "businessName": "FBR Admin",
        "province": "Islamabad Capital Territory",
        "address": "Constitution Avenue, Islamabad",
        "ntncnic": "1234567890123",
        "role": "ADMIN",
        "isActive": true,
        "createdAt": "2026-01-14T15:30:00.000Z",
        "updatedAt": "2026-01-14T15:30:00.000Z"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "businessName": "ABC Trading Company",
        "province": "Punjab",
        "address": "123 Main Street, Lahore",
        "ntncnic": "3520212345678",
        "role": "USER",
        "isActive": true,
        "createdAt": "2026-01-14T16:00:00.000Z",
        "updatedAt": "2026-01-14T16:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

**Error Responses**:

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**403 Forbidden** - Not Admin:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 403
  },
  "message": "You do not have permission to perform this action"
}
```

---

### 3. Get User by ID

Get detailed information about a specific user.

**Endpoint**: `GET /users/:id`

**Headers**:
```
Authorization: Bearer <admin-access-token>
```

**URL Parameters**:
- `id`: User ID (UUID)

**cURL Request**:
```bash
curl -X GET "http://localhost:5000/api/v1/users/660e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "businessName": "ABC Trading Company",
      "province": "Punjab",
      "address": "123 Main Street, Lahore, Pakistan",
      "ntncnic": "3520212345678",
      "role": "USER",
      "postInvoiceTokenTest": "test_token_123",
      "validateInvoiceTokenTest": "validate_test_token_456",
      "postInvoiceToken": "prod_token_789",
      "validateInvoiceToken": "validate_prod_token_012",
      "isActive": true,
      "createdAt": "2026-01-14T16:00:00.000Z",
      "updatedAt": "2026-01-14T16:00:00.000Z"
    }
  }
}
```

**Error Responses**:

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**403 Forbidden** - Not Admin:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 403
  },
  "message": "You do not have permission to perform this action"
}
```

**404 Not Found** - User Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "User not found"
}
```

---

### 4. Update User

Update user information (Admin only).

**Endpoint**: `PATCH /users/:id`

**Headers**:
```
Authorization: Bearer <admin-access-token>
Content-Type: application/json
```

**URL Parameters**:
- `id`: User ID (UUID)

**Request Body** (all fields are optional):
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "businessName": "XYZ Trading Company",
  "province": "Sindh",
  "address": "456 New Avenue, Karachi",
  "ntncnic": "4210312345678",
  "postInvoiceTokenTest": "new_test_token",
  "validateInvoiceTokenTest": "new_validate_test_token",
  "postInvoiceToken": "new_prod_token",
  "validateInvoiceToken": "new_validate_prod_token"
}
```

**cURL Request**:
```bash
curl -X PATCH "http://localhost:5000/api/v1/users/660e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Smith\",\"businessName\":\"XYZ Trading Company\"}"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "John Smith",
      "email": "john.smith@example.com",
      "businessName": "XYZ Trading Company",
      "province": "Sindh",
      "address": "456 New Avenue, Karachi",
      "ntncnic": "4210312345678",
      "role": "USER",
      "postInvoiceTokenTest": "new_test_token",
      "validateInvoiceTokenTest": "new_validate_test_token",
      "postInvoiceToken": "new_prod_token",
      "validateInvoiceToken": "new_validate_prod_token",
      "isActive": true,
      "createdAt": "2026-01-14T16:00:00.000Z",
      "updatedAt": "2026-01-14T17:00:00.000Z"
    }
  }
}
```

**Error Responses**:

**400 Bad Request** - Validation Error:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "[{\"field\":\"email\",\"message\":\"Please provide a valid email\"}]"
}
```

**400 Bad Request** - Duplicate Email/NTN:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "Email or NTN/CNIC already in use"
}
```

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**403 Forbidden** - Not Admin:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 403
  },
  "message": "You do not have permission to perform this action"
}
```

**404 Not Found** - User Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "User not found"
}
```

---

### 5. Delete User

Delete a user (Admin only). Cannot delete admin users.

**Endpoint**: `DELETE /users/:id`

**Headers**:
```
Authorization: Bearer <admin-access-token>
```

**URL Parameters**:
- `id`: User ID (UUID)

**cURL Request**:
```bash
curl -X DELETE "http://localhost:5000/api/v1/users/660e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Success Response (204 No Content)**:
```json
{
  "status": "success",
  "data": null
}
```

**Error Responses**:

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**403 Forbidden** - Not Admin:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 403
  },
  "message": "You do not have permission to perform this action"
}
```

**403 Forbidden** - Cannot Delete Admin:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 403
  },
  "message": "Cannot delete admin user"
}
```

**404 Not Found** - User Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "User not found"
}
```

---

### 6. Toggle User Status

Toggle a user's active/inactive status (Admin only). Cannot deactivate admin users.

**Endpoint**: `PATCH /users/:id/toggle-status`

**Headers**:
```
Authorization: Bearer <admin-access-token>
```

**URL Parameters**:
- `id`: User ID (UUID)

**cURL Request**:
```bash
curl -X PATCH "http://localhost:5000/api/v1/users/660e8400-e29b-41d4-a716-446655440001/toggle-status" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "businessName": "ABC Trading Company",
      "isActive": false
    }
  }
}
```

**Error Responses**:

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**403 Forbidden** - Not Admin:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 403
  },
  "message": "You do not have permission to perform this action"
}
```

**403 Forbidden** - Cannot Deactivate Admin:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 403
  },
  "message": "Cannot deactivate admin user"
}
```

**404 Not Found** - User Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "User not found"
}
```

---

### 7. Update User Password

Update a user's password (Admin only). This will force the user to re-login.

**Endpoint**: `PATCH /users/:id/password`

**Rate Limit**: 3 requests per hour per IP

**Headers**:
```
Authorization: Bearer <admin-access-token>
Content-Type: application/json
```

**URL Parameters**:
- `id`: User ID (UUID)

**Request Body**:
```json
{
  "password": "NewSecurePass@456"
}
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&#)

**cURL Request**:
```bash
curl -X PATCH "http://localhost:5000/api/v1/users/660e8400-e29b-41d4-a716-446655440001/password" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"password\":\"NewSecurePass@456\"}"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Password updated successfully"
}
```

**Note**: All refresh tokens for this user are invalidated, forcing re-login.

**Error Responses**:

**400 Bad Request** - Validation Error:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "[{\"field\":\"password\",\"message\":\"Password must be at least 8 characters long\"}]"
}
```

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**403 Forbidden** - Not Admin:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 403
  },
  "message": "You do not have permission to perform this action"
}
```

**404 Not Found** - User Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "User not found"
}
```

---

## Buyer Management APIs

All buyer endpoints require authentication. Users can only manage their own buyers.

**Required Header**:
```
Authorization: Bearer <access-token>
```

---

### 1. Create Buyer

Create a new buyer for the authenticated user.

**Endpoint**: `POST /buyers`

**Headers**:
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "ntncnic": "9876543210987",
  "businessName": "XYZ Corporation",
  "province": "Sindh",
  "address": "456 Business Avenue, Karachi",
  "registrationType": "Registered"
}
```

**Field Descriptions**:
- `ntncnic`: 13-digit NTN/CNIC (required)
- `businessName`: Business name (required, 2-255 characters)
- `province`: Province (required)
- `address`: Complete address (required, min 5 characters)
- `registrationType`: "Registered" or "Unregistered" (required)

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/buyers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ntncnic": "9876543210987",
    "businessName": "XYZ Corporation",
    "province": "Sindh",
    "address": "456 Business Avenue, Karachi",
    "registrationType": "Registered"
  }'
```

**Success Response (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "buyer": {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "ntncnic": "9876543210987",
      "businessName": "XYZ Corporation",
      "province": "Sindh",
      "address": "456 Business Avenue, Karachi",
      "registrationType": "Registered",
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T10:00:00.000Z"
    }
  }
}
```

**Error Responses**:

**400 Bad Request** - Duplicate Buyer:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "Buyer with this NTN/CNIC already exists"
}
```

**401 Unauthorized**:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

---

### 2. Get All Buyers

Get a paginated list of buyers for the authenticated user.

**Endpoint**: `GET /buyers`

**Headers**:
```
Authorization: Bearer <access-token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in NTN/CNIC, business name, or province
- `registrationType` (optional): Filter by "Registered" or "Unregistered"

**cURL Request**:
```bash
# Get all buyers
curl -X GET "http://localhost:5000/api/v1/buyers" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With search
curl -X GET "http://localhost:5000/api/v1/buyers?search=XYZ" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by registration type
curl -X GET "http://localhost:5000/api/v1/buyers?registrationType=Registered" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "buyers": [
      {
        "id": "990e8400-e29b-41d4-a716-446655440001",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "ntncnic": "9876543210987",
        "businessName": "XYZ Corporation",
        "province": "Sindh",
        "address": "456 Business Avenue, Karachi",
        "registrationType": "Registered",
        "createdAt": "2026-01-17T10:00:00.000Z",
        "updatedAt": "2026-01-17T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 3. Get Buyer by ID

Get detailed information about a specific buyer.

**Endpoint**: `GET /buyers/:id`

**Headers**:
```
Authorization: Bearer <access-token>
```

**cURL Request**:
```bash
curl -X GET "http://localhost:5000/api/v1/buyers/990e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "buyer": {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "ntncnic": "9876543210987",
      "businessName": "XYZ Corporation",
      "province": "Sindh",
      "address": "456 Business Avenue, Karachi",
      "registrationType": "Registered",
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T10:00:00.000Z"
    }
  }
}
```

**404 Not Found**:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "Buyer not found"
}
```

---

### 4. Update Buyer

Update buyer information.

**Endpoint**: `PATCH /buyers/:id`

**Headers**:
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "businessName": "XYZ Corporation Ltd",
  "address": "789 New Business Park, Karachi"
}
```

**cURL Request**:
```bash
curl -X PATCH "http://localhost:5000/api/v1/buyers/990e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"businessName":"XYZ Corporation Ltd"}'
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "buyer": {
      "id": "990e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "ntncnic": "9876543210987",
      "businessName": "XYZ Corporation Ltd",
      "province": "Sindh",
      "address": "789 New Business Park, Karachi",
      "registrationType": "Registered",
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T11:00:00.000Z"
    }
  }
}
```

---

### 5. Delete Buyer

Delete a buyer (only if not used in any invoices).

**Endpoint**: `DELETE /buyers/:id`

**Headers**:
```
Authorization: Bearer <access-token>
```

**cURL Request**:
```bash
curl -X DELETE "http://localhost:5000/api/v1/buyers/990e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (204 No Content)**:
```json
{
  "status": "success",
  "data": null
}
```

**400 Bad Request** - Buyer In Use:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "Cannot delete buyer that is used in invoices"
}
```

---

## HS Code Management APIs

All HS Code endpoints require authentication. Users can only manage their own HS codes.

**Required Header**:
```
Authorization: Bearer <access-token>
```

---

### 1. Create HS Code

Create a new HS Code for the authenticated user.

**Endpoint**: `POST /hs-codes`

**Headers**:
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "hsCode": "0000.0000",
  "description": "Sample product category"
}
```

**Field Descriptions**:
- `hsCode`: HS Code in format XXXX.XXXX (required)
- `description`: Description of the HS Code (optional, max 500 characters)

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/hs-codes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hsCode": "0000.0000",
    "description": "Sample product category"
  }'
```

**Success Response (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "hsCode": {
      "id": "aa0e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "hsCode": "0000.0000",
      "description": "Sample product category",
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T10:00:00.000Z"
    }
  }
}
```

**Error Responses**:

**400 Bad Request** - Duplicate HS Code:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "HS Code already exists"
}
```

---

### 2. Get All HS Codes

Get a paginated list of HS Codes for the authenticated user.

**Endpoint**: `GET /hs-codes`

**Headers**:
```
Authorization: Bearer <access-token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in HS Code or description

**cURL Request**:
```bash
# Get all HS codes
curl -X GET "http://localhost:5000/api/v1/hs-codes" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With search
curl -X GET "http://localhost:5000/api/v1/hs-codes?search=0000" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "hsCodes": [
      {
        "id": "aa0e8400-e29b-41d4-a716-446655440001",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "hsCode": "0000.0000",
        "description": "Sample product category",
        "createdAt": "2026-01-17T10:00:00.000Z",
        "updatedAt": "2026-01-17T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 3. Get HS Code by ID

Get detailed information about a specific HS Code.

**Endpoint**: `GET /hs-codes/:id`

**Headers**:
```
Authorization: Bearer <access-token>
```

**cURL Request**:
```bash
curl -X GET "http://localhost:5000/api/v1/hs-codes/aa0e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "hsCode": {
      "id": "aa0e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "hsCode": "0000.0000",
      "description": "Sample product category",
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T10:00:00.000Z"
    }
  }
}
```

---

### 4. Update HS Code

Update HS Code information.

**Endpoint**: `PATCH /hs-codes/:id`

**Headers**:
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "description": "Updated product category description"
}
```

**cURL Request**:
```bash
curl -X PATCH "http://localhost:5000/api/v1/hs-codes/aa0e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated product category description"}'
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "hsCode": {
      "id": "aa0e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "hsCode": "0000.0000",
      "description": "Updated product category description",
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T11:00:00.000Z"
    }
  }
}
```

---

### 5. Delete HS Code

Delete an HS Code (only if not used in any invoice items).

**Endpoint**: `DELETE /hs-codes/:id`

**Headers**:
```
Authorization: Bearer <access-token>
```

**cURL Request**:
```bash
curl -X DELETE "http://localhost:5000/api/v1/hs-codes/aa0e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (204 No Content)**:
```json
{
  "status": "success",
  "data": null
}
```

**400 Bad Request** - HS Code In Use:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "Cannot delete HS Code that is used in invoice items"
}
```

---

## Scenario Management APIs

All scenario endpoints require authentication.
Users can view their assigned scenarios.
Admins manage global scenarios and assignments.

**Required Header**:
```
Authorization: Bearer <access-token>
```

---

### 1. Create Scenario (Admin)

Create a new scenario for the authenticated user.

**Endpoint**: `POST /scenarios` (ADMIN)

**Headers**:
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "scenarioCode": "SN001",
  "scenarioDescription": "Standard retail sale with 17% tax"
}
```

**Field Descriptions**:
- `scenarioCode`: Unique scenario code (required, 2-50 characters)
- `scenarioDescription`: Description of the scenario (required, 5-500 characters)

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/scenarios \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scenarioCode": "SN001",
    "scenarioDescription": "Standard retail sale with 17% tax"
  }'
```

**Success Response (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "scenario": {
      "id": "cc0e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "scenarioCode": "SN001",
      "scenarioDescription": "Standard retail sale with 17% tax",
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T10:00:00.000Z"
    }
  }
}
```

**Error Responses**:

**400 Bad Request** - Duplicate Scenario:
```json
{
  "status": "fail",
  "message": "Scenario with this code already exists"
}
```

**401 Unauthorized**:
```json
{
  "status": "fail",
  "message": "Authentication token is required"
}
```

---

### 2. Get All Scenarios (User)

Get a paginated list of scenarios for the authenticated user.

**Endpoint**: `GET /scenarios`

**Headers**:
```
Authorization: Bearer <access-token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in scenario code or description

**cURL Request**:
```bash
# Get all scenarios
curl -X GET "http://localhost:5000/api/v1/scenarios" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With search
curl -X GET "http://localhost:5000/api/v1/scenarios?search=retail" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "scenarios": [
      {
        "id": "cc0e8400-e29b-41d4-a716-446655440001",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "scenarioCode": "SN001",
        "scenarioDescription": "Standard retail sale with 17% tax",
        "createdAt": "2026-01-17T10:00:00.000Z",
        "updatedAt": "2026-01-17T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 3. Get Scenario by ID (User)

Get detailed information about a specific scenario.

**Endpoint**: `GET /scenarios/:id`

**Headers**:
```
Authorization: Bearer <access-token>
```

**cURL Request**:
```bash
curl -X GET "http://localhost:5000/api/v1/scenarios/cc0e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "scenario": {
      "id": "cc0e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "scenarioCode": "SN001",
      "scenarioDescription": "Standard retail sale with 17% tax",
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T10:00:00.000Z"
    }
  }
}
```

**404 Not Found**:
```json
{
  "status": "fail",
  "message": "Scenario not found"
}
```

### 4. Get Scenario Options (User)

Returns UI-friendly list for dropdowns.

**Endpoint**: `GET /scenarios/list`

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "options": [
      { "code": "SN001", "description": "Goods at standard rate to registered buyers" },
      { "code": "SN002", "description": "Goods at standard rate to unregistered buyers" }
    ]
  }
}
```

---

### 5. Update Scenario (Admin)

Update scenario information.

**Endpoint**: `PATCH /scenarios/:id` (ADMIN)

**Headers**:
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "scenarioCode": "SN002",
  "scenarioDescription": "Updated description for retail sales"
}
```

**cURL Request**:
```bash
curl -X PATCH "http://localhost:5000/api/v1/scenarios/cc0e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scenarioDescription":"Updated description for retail sales"}'
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "scenario": {
      "id": "cc0e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "scenarioCode": "SN002",
      "scenarioDescription": "Updated description for retail sales",
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T11:00:00.000Z"
    }
  }
}
```

---

### 6. Delete Scenario (Admin)

Delete a scenario (only if not used in any invoices).

**Endpoint**: `DELETE /scenarios/:id` (ADMIN)
---

## Admin Scenario Management APIs

Admins can manage the global catalog of scenarios and assign them to users.

### 1. Create Global Scenario

**Endpoint**: `POST /admin/scenarios/global`

**Headers**:
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "scenarioCode": "SN001",
  "scenarioDescription": "Goods at standard rate to registered buyers"
}
```

### 2. List Global Scenarios

**Endpoint**: `GET /admin/scenarios/global`

### 3. Update Global Scenario

**Endpoint**: `PATCH /admin/scenarios/global/:id`

### 4. Delete Global Scenario

**Endpoint**: `DELETE /admin/scenarios/global/:id`

Blocks deletion when assigned to any user.

### 5. Assign Scenario to User

**Endpoint**: `POST /admin/scenarios/assign`

**Request Body**:
```json
{
  "userId": "<UUID>",
  "scenarioId": "<GlobalScenario UUID>"
}
```

Creates a per-user scenario entry; invoices use the assigned scenario.

### 6. Bulk Assign Scenarios to User

**Endpoint**: `POST /admin/scenarios/assign/bulk`

**Request Body** (provide either `scenarioIds` or `scenarioCodes`):
```json
{
  "userId": "<UUID>",
  "scenarioIds": ["<GlobalScenario UUID>", "<GlobalScenario UUID>"]
}
```
Or
```json
{
  "userId": "<UUID>",
  "scenarioCodes": ["SN001", "SN002", "SN003"]
}
```

Assigns multiple global scenarios to the user in one call.

### 7. Unassign Scenario from User

**Endpoint**: `DELETE /admin/scenarios/assign`

Blocks unassign when scenario is used in invoices.

### 8. List User Assignments

**Endpoint**: `GET /admin/scenarios/users/:userId`

**Headers**:
```
Authorization: Bearer <access-token>
```

**cURL Request**:
```bash
curl -X DELETE "http://localhost:5000/api/v1/scenarios/cc0e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (204 No Content)**:
```json
{
  "status": "success",
  "data": null
}
```

**400 Bad Request** - Scenario In Use:
```json
{
  "status": "fail",
  "message": "Cannot delete scenario that is used in invoices"
}
```

---


## Invoice Management APIs

All invoice endpoints require authentication. Users can only manage their own invoices.

**Important**: Before creating invoices, you must first create:
1. **Buyers** - Using the Buyer Management APIs
2. **HS Codes** - Using the HS Code Management APIs
3. **Scenarios** - Using the Scenario Management APIs

**Seller Information** is automatically fetched from your user profile (NTN/CNIC, business name, province, address).

**Required Header**:
```
Authorization: Bearer <access-token>
```

---

### 1. Post Invoice to FBR

Submit an invoice to FBR's system (Sandbox or Production environment).

**Prerequisites**: 
- Create buyers using `/buyers` endpoint
- Create HS codes using `/hs-codes` endpoint
- Ensure scenarios exist (if using custom scenarios)

**Endpoint**: `POST /invoices`

**Headers**:
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "invoiceType": "Sale Invoice",
  "invoiceDate": "2026-01-17",
  "buyerId": "990e8400-e29b-41d4-a716-446655440001",
  "scenarioId": "aa0e8400-e29b-41d4-a716-446655440001",
  "invoiceRefNo": "INV-2026-001",
  "isTestEnvironment": true,
  "items": [
    {
      "hsCodeId": "bb0e8400-e29b-41d4-a716-446655440001",
      "productDescription": "Sample Product",
      "rate": "17%",
      "uoM": "PCS",
      "quantity": 10,
      "totalValues": 1000,
      "valueSalesExcludingST": 854.70,
      "fixedNotifiedValueOrRetailPrice": 1000,
      "salesTaxApplicable": 145.30,
      "salesTaxWithheldAtSource": 0,
      "extraTax": "",
      "furtherTax": 0,
      "sroScheduleNo": "",
      "fedPayable": 0,
      "discount": 0,
      "sroItemSerialNo": ""
    }
  ]
}
```

**Field Descriptions**:
- `invoiceType`: Type of invoice (e.g., "Sale Invoice") - required
- `invoiceDate`: Date in yyyy-MM-dd format - required
- `buyerId`: UUID of the buyer (must be created first) - required
- `scenarioId`: UUID of the scenario - required
- `invoiceRefNo`: Optional reference number
- `isTestEnvironment`: true for sandbox, false for production (default: true)
- `items`: Array of invoice items (at least 1 required)

**Seller Information** (automatically fetched from your user profile):
- Seller's NTN/CNIC
- Seller's business name
- Seller's province
- Seller's address

**Buyer Information** (fetched from buyer table using `buyerId`)
**Scenario Information** (fetched from scenario table using `scenarioId` - scenario description is used as `saleType` in FBR request)
**HS Code** (fetched from hs_codes table using `hsCodeId` for each item)

**Item Fields**:
- `hsCodeId`: UUID of the HS Code (must be created first) - required
- `productDescription`: Description of the product - required
- `rate`: Tax rate (e.g., "17%") - required
- `uoM`: Unit of measurement - required
- `quantity`: Quantity of items - required
- `totalValues`: Total value including tax - required
- `valueSalesExcludingST`: Value excluding sales tax - required
- `fixedNotifiedValueOrRetailPrice`: Fixed/retail price - required
- `salesTaxApplicable`: Applicable sales tax amount - required
- `salesTaxWithheldAtSource`: Tax withheld at source - required
- `extraTax`: Additional tax (optional)
- `furtherTax`: Further tax amount - required
- `sroScheduleNo`: SRO schedule number (optional)
- `fedPayable`: Federal excise duty payable - required
- `discount`: Discount amount - required
- `saleType`: Type of sale (optional)
- `sroItemSerialNo`: SRO item serial number (optional)

**Sale Type via Scenario**:
- The system sets `saleType` for all items using the selected scenario's description.
- Pick a scenario by its code (SN001–SN028); keep the description aligned with FBR guidance.
- Examples (Sandbox):
  - SN001: Goods at standard rate to registered buyers
  - SN002: Goods at standard rate to unregistered buyers
  - SN003: Sale of Steel (Melted and Re-Rolled)
  - SN004: Steel Melting and re-rolling / Ship breaking
  - SN005: Reduced rate sale
  - SN006: Goods at Reduced Rate
  - SN007: Exempt Goods
  - SN008: Goods at zero-rate
  - SN009: Cotton Spinners purchase from Cotton Ginners (Textile Sector)
  - SN010: Telecom services rendered or provided
  - SN011: Telecommunication services
  - SN012: Toll Manufacturing (Steel sector)
  - SN013: Petroleum Products
  - SN014: Electricity Supply to Retailers
  - SN015: Gas to CNG stations
  - SN016: Mobile Phones
  - SN017: Processing / Conversion of Goods
  - SN018: Goods (FED in ST Mode)
  - SN019: Services (FED in ST Mode)
  - SN020: Services
  - SN021: Electric Vehicle
  - SN022: Cement / Concrete Block
  - SN023: Potassium Chlorate
  - SN024: CNG Sales
  - SN025: Goods as per SRO 297(1)/2023
  - SN026: Non-Adjustable Supplies
  - SN027: Sale to End Consumer by retailers (Standard Rate)
  - SN028: 3rd Schedule Goods / End Consumer (Reduced Rate)

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/invoices \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceType": "Sale Invoice",
    "invoiceDate": "2026-01-17",
    "buyerId": "990e8400-e29b-41d4-a716-446655440001",
    "scenarioId": "aa0e8400-e29b-41d4-a716-446655440001",
    "invoiceRefNo": "INV-2026-001",
    "isTestEnvironment": true,
    "items": [
      {
        "hsCodeId": "bb0e8400-e29b-41d4-a716-446655440001",
        "productDescription": "Sample Product",
        "rate": "17%",
        "uoM": "PCS",
        "quantity": 10,
        "totalValues": 1000,
        "valueSalesExcludingST": 854.70,
        "fixedNotifiedValueOrRetailPrice": 1000,
        "salesTaxApplicable": 145.30,
        "salesTaxWithheldAtSource": 0,
        "extraTax": "",
        "furtherTax": 0,
        "sroScheduleNo": "",
        "fedPayable": 0,
        "discount": 0,
        "sroItemSerialNo": ""
      }
    ]
  }'
```

**Success Response (201 Created)**:
```json
{
  "status": "success",
  "data": {
    "invoice": {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "buyerId": "990e8400-e29b-41d4-a716-446655440001",
      "scenarioId": "aa0e8400-e29b-41d4-a716-446655440001",
      "invoiceType": "Sale Invoice",
      "invoiceDate": "2026-01-17T00:00:00.000Z",
      "invoiceRefNo": "INV-2026-001",
      "fbrInvoiceNumber": "FBR123456789",
      "fbrResponse": {
        "invoiceNumber": "FBR123456789",
        "status": "success",
        "message": "Invoice posted successfully"
      },
      "isTestEnvironment": true,
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T10:00:00.000Z",
      "items": [
        {
          "id": "880e8400-e29b-41d4-a716-446655440001",
          "invoiceId": "770e8400-e29b-41d4-a716-446655440001",
          "hsCodeId": "bb0e8400-e29b-41d4-a716-446655440001",
          "productDescription": "Sample Product",
          "rate": "17%",
          "uoM": "PCS",
          "quantity": "10",
          "totalValues": "1000.00",
          "valueSalesExcludingST": "854.70",
          "fixedNotifiedValueOrRetailPrice": "1000.00",
          "salesTaxApplicable": "145.30",
          "salesTaxWithheldAtSource": "0.00",
          "extraTax": "",
          "furtherTax": "0.00",
          "sroScheduleNo": "",
          "fedPayable": "0.00",
          "discount": "0.00",
          "saleType": "",
          "sroItemSerialNo": "",
          "createdAt": "2026-01-17T10:00:00.000Z",
          "updatedAt": "2026-01-17T10:00:00.000Z",
          "hsCode": {
            "id": "bb0e8400-e29b-41d4-a716-446655440001",
            "hsCode": "0000.0000",
            "description": "Sample product category"
          }
        }
      ],
      "buyer": {
        "id": "990e8400-e29b-41d4-a716-446655440001",
        "ntncnic": "9876543210987",
        "businessName": "XYZ Corporation",
        "province": "Sindh",
        "address": "456 Business Avenue, Karachi",
        "registrationType": "Registered"
      },
      "scenario": {
        "id": "aa0e8400-e29b-41d4-a716-446655440001",
        "scenarioCode": "SN000",
        "scenarioDescription": "Standard Sale"
      }
    },
    "fbrResponse": {
      "invoiceNumber": "FBR123456789",
      "status": "success",
      "message": "Invoice posted successfully"
    }
  }
}
```

**Error Responses**:

**400 Bad Request** - Validation Error:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "[{\"field\":\"buyerId\",\"message\":\"Buyer ID must be a valid UUID\"}]"
}
```

**404 Not Found** - Buyer Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "Buyer not found"
}
```

**404 Not Found** - Scenario Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "Scenario not found"
}
```

**404 Not Found** - HS Code Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "One or more HS codes not found"
}
```

**400 Bad Request** - Missing FBR Token:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "FBR test token not configured for this user"
}
```

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**500 Internal Server Error** - FBR API Error:
```json
{
  "status": "error",
  "error": {
    "statusCode": 500
  },
  "message": "FBR API Error: Failed to post invoice"
}
```

---

### 2. Validate Invoice with FBR

Validate an invoice number with FBR's system.

**Endpoint**: `POST /invoices/validate`

**Headers**:
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "invoiceNumber": "FBR123456789",
  "isTestEnvironment": true
}
```

**Field Descriptions**:
- `invoiceNumber`: FBR invoice number to validate (required)
- `isTestEnvironment`: true for sandbox, false for production (default: true)

**cURL Request**:
```bash
curl -X POST http://localhost:5000/api/v1/invoices/validate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"invoiceNumber":"FBR123456789","isTestEnvironment":true}'
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "invoiceNumber": "FBR123456789",
    "validationResult": {
      "status": "valid",
      "message": "Invoice is valid",
      "invoiceDetails": {
        "invoiceNumber": "FBR123456789",
        "invoiceDate": "2026-01-17",
        "sellerNTN": "1234567890123",
        "buyerNTN": "9876543210987",
        "totalAmount": 1000
      }
    }
  }
}
```

**Error Responses**:

**400 Bad Request** - Missing Invoice Number:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "[{\"field\":\"invoiceNumber\",\"message\":\"Invoice number is required\"}]"
}
```

**400 Bad Request** - Missing FBR Token:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "FBR test validation token not configured for this user"
}
```

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

---

### 3. Get User Invoices

Get a paginated list of invoices for the authenticated user with optional filtering.

**Endpoint**: `GET /invoices`

**Headers**:
```
Authorization: Bearer <access-token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `invoiceType` (optional): Filter by invoice type
- `isTestEnvironment` (optional): Filter by environment (true or false)
- `startDate` (optional): Filter by start date (yyyy-MM-dd)
- `endDate` (optional): Filter by end date (yyyy-MM-dd)

**cURL Request**:
```bash
# Get all invoices (page 1, 10 per page)
curl -X GET "http://localhost:5000/api/v1/invoices" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With pagination
curl -X GET "http://localhost:5000/api/v1/invoices?page=2&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by invoice type
curl -X GET "http://localhost:5000/api/v1/invoices?invoiceType=Sale%20Invoice" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by environment
curl -X GET "http://localhost:5000/api/v1/invoices?isTestEnvironment=true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by date range
curl -X GET "http://localhost:5000/api/v1/invoices?startDate=2026-01-01&endDate=2026-01-31" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "invoices": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440001",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "invoiceType": "Sale Invoice",
        "invoiceDate": "2026-01-17T00:00:00.000Z",
        "sellerNTNCNIC": "1234567890123",
        "sellerBusinessName": "ABC Trading Company",
        "sellerProvince": "Punjab",
        "sellerAddress": "123 Main Street, Lahore",
        "buyerNTNCNIC": "9876543210987",
        "buyerBusinessName": "XYZ Corporation",
        "buyerProvince": "Sindh",
        "buyerAddress": "456 Business Avenue, Karachi",
        "buyerRegistrationType": "Registered",
        "invoiceRefNo": "INV-2026-001",
        "scenarioId": "SN000",
        "fbrInvoiceNumber": "FBR123456789",
        "fbrResponse": {},
        "isTestEnvironment": true,
        "createdAt": "2026-01-17T10:00:00.000Z",
        "updatedAt": "2026-01-17T10:00:00.000Z",
        "items": [
          {
            "id": "880e8400-e29b-41d4-a716-446655440001",
            "invoiceId": "770e8400-e29b-41d4-a716-446655440001",
            "hsCode": "0000.0000",
            "productDescription": "Sample Product",
            "rate": "17%",
            "uoM": "PCS",
            "quantity": "10",
            "totalValues": "1000.00",
            "valueSalesExcludingST": "854.70",
            "fixedNotifiedValueOrRetailPrice": "1000.00",
            "salesTaxApplicable": "145.30",
            "salesTaxWithheldAtSource": "0.00",
            "extraTax": "",
            "furtherTax": "0.00",
            "sroScheduleNo": "",
            "fedPayable": "0.00",
            "discount": "0.00",
            "saleType": "",
            "sroItemSerialNo": "",
            "createdAt": "2026-01-17T10:00:00.000Z",
            "updatedAt": "2026-01-17T10:00:00.000Z"
          }
        ]
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

**Error Responses**:

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

---

### 4. Get Invoice by ID

Get detailed information about a specific invoice.

**Endpoint**: `GET /invoices/:id`

**Headers**:
```
Authorization: Bearer <access-token>
```

**URL Parameters**:
- `id`: Invoice ID (UUID)

**cURL Request**:
```bash
curl -X GET "http://localhost:5000/api/v1/invoices/770e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "invoice": {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "invoiceType": "Sale Invoice",
      "invoiceDate": "2026-01-17T00:00:00.000Z",
      "sellerNTNCNIC": "1234567890123",
      "sellerBusinessName": "ABC Trading Company",
      "sellerProvince": "Punjab",
      "sellerAddress": "123 Main Street, Lahore",
      "buyerNTNCNIC": "9876543210987",
      "buyerBusinessName": "XYZ Corporation",
      "buyerProvince": "Sindh",
      "buyerAddress": "456 Business Avenue, Karachi",
      "buyerRegistrationType": "Registered",
      "invoiceRefNo": "INV-2026-001",
      "scenarioId": "SN000",
      "fbrInvoiceNumber": "FBR123456789",
      "fbrResponse": {},
      "isTestEnvironment": true,
      "createdAt": "2026-01-17T10:00:00.000Z",
      "updatedAt": "2026-01-17T10:00:00.000Z",
      "items": [
        {
          "id": "880e8400-e29b-41d4-a716-446655440001",
          "invoiceId": "770e8400-e29b-41d4-a716-446655440001",
          "hsCode": "0000.0000",
          "productDescription": "Sample Product",
          "rate": "17%",
          "uoM": "PCS",
          "quantity": "10",
          "totalValues": "1000.00",
          "valueSalesExcludingST": "854.70",
          "fixedNotifiedValueOrRetailPrice": "1000.00",
          "salesTaxApplicable": "145.30",
          "salesTaxWithheldAtSource": "0.00",
          "extraTax": "",
          "furtherTax": "0.00",
          "sroScheduleNo": "",
          "fedPayable": "0.00",
          "discount": "0.00",
          "saleType": "",
          "sroItemSerialNo": "",
          "createdAt": "2026-01-17T10:00:00.000Z",
          "updatedAt": "2026-01-17T10:00:00.000Z"
        }
      ],
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Xenax_33",
        "email": "admin@fbr.gov.pk",
        "businessName": "FBR Admin"
      }
    }
  }
}
```

**Error Responses**:

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**404 Not Found** - Invoice Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "Invoice not found"
}
```

---

### 5. Delete Invoice

Delete an invoice (only the user who created it can delete it).

**Endpoint**: `DELETE /invoices/:id`

**Headers**:
```
Authorization: Bearer <access-token>
```

**URL Parameters**:
- `id`: Invoice ID (UUID)

**cURL Request**:
```bash
curl -X DELETE "http://localhost:5000/api/v1/invoices/770e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (204 No Content)**:
```json
{
  "status": "success",
  "data": null
}
```

**Error Responses**:

**401 Unauthorized** - Not Authenticated:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 401
  },
  "message": "Authentication token is required"
}
```

**404 Not Found** - Invoice Not Found:
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404
  },
  "message": "Invoice not found"
}
```

---

## Error Responses

### Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request successful, no content to return |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

### Error Response Format

All errors follow this format:

```json
{
  "status": "fail" | "error",
  "error": {
    "statusCode": 400,
    // Additional error details in development mode
  },
  "message": "Error message here"
}
```

### Validation Errors

Validation errors return an array of field-specific errors:

```json
{
  "status": "fail",
  "error": {
    "statusCode": 400
  },
  "message": "[{\"field\":\"email\",\"message\":\"Please provide a valid email\"},{\"field\":\"password\",\"message\":\"Password must be at least 8 characters long\"}]"
}
```

---

## Authentication Flow

1. **Login**: Call `/auth/login` with email and password
2. **Store Tokens**: Save both `accessToken` and `refreshToken`
3. **API Requests**: Include `accessToken` in `Authorization: Bearer <token>` header
4. **Token Expiry**: When access token expires (401 error), call `/auth/refresh`
5. **Logout**: Call `/auth/logout` with refresh token to invalidate session

---

## Testing with cURL

### Complete Flow Example

```bash
# 1. Login as admin
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fbr.gov.pk","password":"Admin@123"}'

# Save the accessToken and refreshToken from response

# 2. Create a new user
curl -X POST http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","businessName":"Test Business","province":"Punjab","address":"Test Address","ntncnic":"1234567890123","password":"TestPass@123"}'

# 3. Get all users
curl -X GET http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 4. Logout
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- User IDs are UUIDs (v4)
- Access tokens expire in 24 hours
- Refresh tokens expire in 7 days
- All API endpoints return JSON responses
- Passwords are hashed using bcrypt (12 rounds)
- NTN/CNIC must be exactly 13 digits

---

**Last Updated**: January 14, 2026
**Version**: 1.0.0
