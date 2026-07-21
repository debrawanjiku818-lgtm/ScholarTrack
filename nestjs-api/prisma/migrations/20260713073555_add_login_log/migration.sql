-- CreateTable
CREATE TABLE "login_logs" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL,
    "ip_address" TEXT,
    "login_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_logs_pkey" PRIMARY KEY ("id")
);
