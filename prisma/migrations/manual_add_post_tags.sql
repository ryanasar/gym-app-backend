-- CreateTable
CREATE TABLE "PostTag" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostTag_postId_idx" ON "PostTag"("postId");

-- CreateIndex
CREATE INDEX "PostTag_userId_idx" ON "PostTag"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PostTag_postId_userId_key" ON "PostTag"("postId", "userId");

-- AddForeignKey
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
