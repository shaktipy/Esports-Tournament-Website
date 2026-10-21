# HAARSH XO Arena — Frontend Multi-stage Dockerfile

# ─── Stage 1: Build React Vite SPA ──────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy package manifests and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source code
COPY . .

# Build-time environment arguments (injected at build time, no hardcoded secrets)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_RAZORPAY_KEY_ID
ARG VITE_BACKEND_URL
ARG VITE_YOUTUBE_API_KEY
ARG VITE_YOUTUBE_CHANNEL_ID

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_YOUTUBE_API_KEY=$VITE_YOUTUBE_API_KEY
ENV VITE_YOUTUBE_CHANNEL_ID=$VITE_YOUTUBE_CHANNEL_ID

# Build production bundle into /app/dist
RUN npm run build

# ─── Stage 2: Serve with Nginx Alpine ────────────────────────────────────────
FROM nginx:alpine

# Remove default nginx boilerplate files
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled SPA static assets from builder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
