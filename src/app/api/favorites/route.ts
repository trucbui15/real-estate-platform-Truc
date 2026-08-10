import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Lưu tin yêu thích — bắt buộc đăng nhập (đúng yêu cầu: xem thoải mái, tương tác thì phải đăng ký)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { listing: true },
  });
  return NextResponse.json(favorites);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Vui lòng đăng nhập để lưu tin" }, { status: 401 });

  const { listingId } = await req.json();
  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId: session.user.id, listingId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({ data: { userId: session.user.id, listingId } });
  return NextResponse.json({ favorited: true });
}
