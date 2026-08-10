import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageCustomers, canManageAllListings } from "@/lib/permissions";

// Thêm 1 mục lịch sử chăm sóc (gọi điện / gặp mặt / ghi chú)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const customer = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!customer) return NextResponse.json({ error: "Không tìm thấy khách hàng" }, { status: 404 });

  if (
    !session ||
    !canManageCustomers(session.user.role) ||
    (!canManageAllListings(session.user.role) && customer.assignedToId !== session.user.id)
  ) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const body = await req.json();
  if (!body.content) return NextResponse.json({ error: "Nội dung không được để trống" }, { status: 400 });

  const activity = await prisma.customerActivity.create({
    data: {
      customerId: params.id,
      authorId: session.user.id,
      type: body.type || "NOTE",
      content: body.content,
    },
  });

  return NextResponse.json(activity, { status: 201 });
}
