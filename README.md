# clinical-ai-monitor

An application to monitor clinical AI models.

This is a Next.js application to monitor clinical AI models. It uses a React frontend with a clean, clinical dashboard interface.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 14 or later)
- npm (usually comes with Node.js)

## Getting Started

To get the application running on your local machine, follow these steps:

1. Clone the repository:

```bash
git clone git@github.com:VectorInstitute/clinical-ai-monitor.git
```

2. Navigate to the project frontend directory:

```bash
cd clinical-ai-monitor/frontend
```

3. Install the dependencies:

```bash
npm install
```

4. Run the frontend server in development mode:

```bash
npm run dev -- -p <port>
```

5. Navigate to the repository root and install backend dependencies:

```bash
cd clinical-ai-monitor
poetry install
```

6. Run the backend server:

```bash
uvicorn backend.api.main:app --reload --host 0.0.0.0 --port <port>
```

6. Open your browser and visit `http://localhost:<port>` to see the application.

## System Architecture

TODO

## Project Structure

This project is divided into two main directories: `frontend` for the Next.js application and `backend` for the FastAPI server.

### Frontend (Next.js)

```
frontend/
├── src/
│   ├── app/
│   │   ├── login/
│   │   ├── components/
│   │   ├── context/
│   │   ├── configure/
│   │   │   ├── components/
│   │   │   ├── logs/
│   │   │   ├── types/
│   │   │   ├── model-facts/
│   │   │   └── page.tsx
│   │   ├── home/
│   │   ├── context/
│   │   ├── model/
│   │   │   └── [id]/
│   │   │       ├── utils/
│   │   │       ├── components/
│   │   │       ├── tabs/
│   │   │       ├── types/
│   │   │       └── page.tsx
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
├── public/
│   └── images/
├── package.json
└── next.config.mjs
```

### Backend (FastAPI)

```
backend/
├── api/
│   ├── main.py
│   ├── models/
│   ├── routes.py
│   └── login.py
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache 2.0 license.

## Acknowledgements

- [Vector Institute](https://vectorinstitute.ai/)
- [GEMINI](https://geminimedicine.ca/)
