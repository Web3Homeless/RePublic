# syntax=docker/dockerfile:1
FROM node:18-buster

ENV PNPM_HOME="/pnpm"

ENV PATH="$PNPM_HOME:$PATH"

COPY . /republic
WORKDIR /republic

RUN corepack enable
RUN corepack prepare pnpm@8.15.1 --activate

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN npm link
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"