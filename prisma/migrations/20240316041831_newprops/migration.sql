/*
  Warnings:

  - Added the required column `branch` to the `UserDeployment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `details` to the `UserDeployment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `environment` to the `UserDeployment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUpdated` to the `UserDeployment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `UserDeployment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "BranchMapper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "brach" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserDeployment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "deployedAddress" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "lastUpdated" DATETIME NOT NULL,
    "details" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL
);
INSERT INTO "new_UserDeployment" ("chainId", "deployedAddress", "id", "owner", "project_id", "repoName", "user_id") SELECT "chainId", "deployedAddress", "id", "owner", "project_id", "repoName", "user_id" FROM "UserDeployment";
DROP TABLE "UserDeployment";
ALTER TABLE "new_UserDeployment" RENAME TO "UserDeployment";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
