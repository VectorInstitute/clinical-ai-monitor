# clinical-ai-monitor

An application to monitor clinical AI models.

This is a Next.js application to monitor clinical AI models. It uses a React frontend with a clean, clinical dashboard interface.

## Getting Started

Docker is used for development and production.

1. Clone the repository:

```bash
git clone git@github.com:VectorInstitute/clinical-ai-monitor.git
```

### Production

To deploy the production application:

```bash
docker compose --env-file .env.production -f docker-compose.yml build
docker compose --env-file .env.production -f docker-compose.yml up
```

### Development

To launch the application for development:

```bash
docker compose --env-file .env.development -f docker-compose.dev.yml build
docker compose --env-file .env.development -f docker-compose.dev.yml up
```

Open your browser and visit `http://localhost:<port>` to see the application.
The port can be modified in the respective `.env` files.


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
