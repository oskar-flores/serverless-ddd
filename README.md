# Travier Plane Ticketing Service

A serverless plane ticketing service built using Domain-Driven Design (DDD) principles, AWS Lambda, DynamoDB, and EventBridge.

This repository contains the companion code to the book **"Serverless Domain Driven Design for the Busy Developer"** by Oskar Flores.

This book is available at https://leanpub.com/serverlessdddd

## Project Overview

This project implements a plane ticketing service with two bounded contexts:

1. **Booking Context (Core)**: Handles ticket reservations, check-ins, and cancellations.
2. **Payment Context (Supporting)**: Manages payment processing and refunds.

The application follows DDD principles and clean architecture, with a clear separation of concerns between different layers:

- **Domain Layer**: Contains entities, value objects, and domain services
- **Application Layer**: Contains use cases that orchestrate domain logic
- **Infrastructure Layer**: Contains adapters and repositories for external services

## Project Structure

```
src/
├── context/                    # Domain contexts
│   ├── booking/                # Booking bounded context
│   │   ├── domain/             # Domain layer
│   │   │   ├── events/         # Domain events
│   │   │   ├── model/          # Domain models
│   │   │   ├── repositories/   # Repository interfaces
│   │   │   └── services/       # Domain services
│   │   ├── application/        # Application layer
│   │   │   └── useCases/       # Use cases
│   │   ├── infrastructure/     # Infrastructure layer
│   │   │   ├── adapters/       # Adapters for external services
│   │   │   │   └── handlers/   # Lambda handlers
│   │   │   └── repositories/   # Repository implementations
│   │   └── test/               # Tests
│   │       ├── it/             # Integration tests
│   │       └── unit/           # Unit tests
│   ├── payment/                # Payment bounded context
│   │   ├── domain/             # Domain layer
│   │   │   ├── DomainEvents/   # Domain events
│   │   │   ├── model/          # Domain models
│   │   │   ├── repository/     # Repository interfaces
│   │   │   └── services/       # Domain services
│   │   ├── application/        # Application layer
│   │   │   └── useCases/       # Use cases
│   │   ├── infrastructure/     # Infrastructure layer
│   │   │   ├── adapters/       # Adapters for external services
│   │   │   │   └── handlers/   # Lambda handlers
│   │   │   └── repositories/   # Repository implementations
│   │   └── test/               # Tests
│   │       ├── it/             # Integration tests
│   │       └── unit/           # Unit tests
│   └── shared/                 # Shared code
│       ├── domain/             # Shared domain
│       │   └── events/         # Shared domain events
│       └── infrastructure/     # Shared infrastructure
├── infrastructure/             # Infrastructure as code
│   └── cdk/                    # AWS CDK stacks
└── webapp/                     # React web application
    ├── public/                 # Public assets
    └── src/                    # React source code
        └── pages/              # Page components
```

## Features

### Booking Context

- **Reserve Ticket**: Create a new ticket reservation
- **Check-in Ticket**: Check in a ticket
- **Cancel Ticket**: Cancel a ticket

### Payment Context

- **Process Payment**: Process a payment for a ticket
- **Issue Refund**: Issue a refund for a payment

## Technologies Used

- **TypeScript**: Programming language
- **AWS Lambda**: Serverless compute
- **Amazon DynamoDB**: NoSQL database
- **Amazon EventBridge**: Event bus for communication between bounded contexts
- **Amazon API Gateway**: HTTP API endpoints
- **AWS CDK**: Infrastructure as code

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- AWS CLI configured with appropriate credentials
- AWS CDK installed globally (`npm install -g aws-cdk`)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the project:
   ```
   npm run build
   ```

### Deployment

Deploy all stacks:
```
npm run deploy
```

Or deploy individual stacks:
```
npm run deploy:shared   # Deploy shared infrastructure
npm run deploy:booking  # Deploy booking context
npm run deploy:payment  # Deploy payment context
```

## API Endpoints

After deployment, the following API endpoints will be available:

### Booking API

- `POST /booking/reserve`: Reserve a ticket
- `POST /booking/check-in`: Check in a ticket
- `POST /booking/cancel`: Cancel a ticket

### Payment API

- `POST /payment/process`: Process a payment
- `POST /payment/refund`: Issue a refund

## Event-Driven Communication

The application uses EventBridge for communication between bounded contexts:

- When a ticket is reserved, a `TicketReserved` event is published
- When a ticket is checked in, a `TicketCheckedIn` event is published
- When a ticket is cancelled, a `TicketCancelled` event is published
- When a payment is processed, a `PaymentProcessed` event is published
- When a refund is issued, a `RefundIssued` event is published

## Architecture

The application follows a serverless architecture with clear boundaries between different bounded contexts. Each bounded context has its own data store and API endpoints, and they communicate with each other through events.

![Architecture Diagram](https://via.placeholder.com/800x400?text=Travier+Architecture+Diagram)

## Web Application

The project includes a React-based web application that provides a user interface for interacting with the Travier Plane Ticketing Service. The web app allows users to:

- View information about the service
- Book flights by entering flight and passenger details
- Check in for flights using ticket information
- Process payments and view payment history

### Web App Features

- **Home Page**: Overview of the service and quick links to main features
- **Booking Page**: Form for reserving a new ticket
- **Check-in Page**: Form for checking in for a flight
- **Payment Page**: Form for processing payments and viewing payment history

### Running the Web Application

To run the web application locally:

1. Install dependencies (if not already done):
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run start:webapp
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Building the Web Application

To build the web application for production:

```
npm run build:webapp
```

The built files will be available in the `src/webapp/dist` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
