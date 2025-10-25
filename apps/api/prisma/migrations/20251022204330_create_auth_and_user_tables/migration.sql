-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('ADMIN', 'VERIFIED_USER');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('LOGIN', 'PASSWORD_RESET', 'EMAIL_VERIFICATION');

-- CreateTable
CREATE TABLE "users" (
    "internalId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "unverifiedEmail" TEXT,
    "hash" TEXT NOT NULL,
    "roles" "Roles"[] DEFAULT ARRAY[]::"Roles"[],

    CONSTRAINT "users_pkey" PRIMARY KEY ("internalId")
);

-- CreateTable
CREATE TABLE "tokens" (
    "internalId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "rootTokenId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "type" "TokenType" NOT NULL DEFAULT 'LOGIN',

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("internalId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_id_key" ON "tokens"("id");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_tokenHash_key" ON "tokens"("tokenHash");
