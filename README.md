# ChatBot Graphical Interface - Diabetes Management

An intelligent chatbot with a graphical interface for diabetes management, allowing users to track their blood sugar levels, chat with an AI assistant, and manage their medical profile.

## Features

- **Secure Authentication**: Registration and login with email validation and JWT
- **Blood Sugar Tracking**: Recording and visualization of blood sugar levels
- **AI Chatbot**: Natural interaction with an assistant using Rasa to understand messages
- **Modern User Interface**: React application with Bootstrap for a smooth experience
- **Secure Database**: MongoDB for securely storing user data

## Project Architecture

### Main Components

1. **Backend (Flask)**: REST API with JWT authentication
   - Technologies: Python, Flask, PyJWT, email-validator
   - Role: User management, blood sugar data, chatbot integration

2. **Frontend (React)**: User interface
   - Technologies: JavaScript, React, Axios, Bootstrap, Chart.js
   - Role: Graphical interface for user interaction

3. **Database (MongoDB)**: Data storage
   - Technologies: MongoDB
   - Role: Persistence of users, blood sugar records, chat history

4. **NLU Engine (Rasa)**: Natural language understanding
   - Technologies: Rasa, Python
   - Role: Analysis of user messages and generation of contextual responses

## Installation and Setup

Follow the detailed instructions in `setup_instructions.txt`.

### Prerequisites

- Python 3.8+
- Node.js 14+
- MongoDB
- Git

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ChatBot_Diabetes_Project
   ```

2. **Set up MongoDB**:
   ```bash
   mongod --dbpath "C:\data\db"
   ```

3. **Start the backend**:
   ```bash
   cd Backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env  # Configure environment variables
   python app.py
   ```

4. **Start the frontend**:
   ```bash
   cd ../frontendapp1
   npm install
   cp .env.example .env  # Configure REACT_APP_API_URL
   npm start
   ```

5. **Start Rasa**:
   ```bash
   cd ../rasa_project
   python -m venv rasa_env
   rasa_env\Scripts\activate
   pip install rasa
   rasa run
   ```

6. **Access the application**: http://localhost:3000

## Usage

1. **Registration/Login**: Create an account or log in
2. **Profile**: Manage your personal information
3. **Blood Sugar**: Record your measurements and view trends
4. **Chatbot**: Chat with the AI assistant for diabetes advice

## API Endpoints

- `POST /api/register`: User registration
- `POST /api/login`: Login
- `GET /api/profile`: User profile
- `GET/POST /api/glycemia`: Blood sugar management
- `GET/POST/DELETE /api/chat/*`: Chatbot interactions

## Security

- JWT authentication with 24-hour expiration
- Strict email validation
- Password hashing
- Environment variables for secrets
- Protection against MongoDB injections

## Development

### Project Structure

```
ChatBot_Diabetes_Project/
├── Backend/              # Flask API
│   ├── app.py           # Main application
│   ├── requirements.txt # Python dependencies
│   └── .env.example     # Environment variables
├── frontendapp1/        # React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   └── App.js      # Main application
│   └── package.json     # Node.js dependencies
├── rasa_project/        # Rasa configuration
│   ├── domain.yml
│   ├── data/
│   └── actions/
└── setup_instructions.txt # Installation guide
```

### Testing

- Backend: Unit tests with pytest
- Frontend: Tests with Jest/React Testing Library
- Integration: Manual API tests via interface

## Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request
