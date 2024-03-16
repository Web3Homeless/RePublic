/*
  Warnings:

  - You are about to drop the column `brach` on the `BranchMapper` table. All the data in the column will be lost.
  - Added the required column `branch` to the `BranchMapper` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deployTarget` to the `BranchMapper` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BranchMapper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "deployTarget" TEXT NOT NULL
);
INSERT INTO "new_BranchMapper" ("id", "project_id", "user_id") SELECT "id", "project_id", "user_id" FROM "BranchMapper";
DROP TABLE "BranchMapper";
ALTER TABLE "new_BranchMapper" RENAME TO "BranchMapper";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
