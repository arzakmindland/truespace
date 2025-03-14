import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// DELETE /api/user/favorites/[id] - Удалить курс из избранного
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    const courseId = params.id;
    if (!courseId) {
      return NextResponse.json({ error: "ID курса не указан" }, { status: 400 });
    }
    
    // Удаляем курс из избранного
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $pull: { favorites: courseId } },
      { new: true }
    );
    
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Курс удален из избранного" });
  } catch (error) {
    console.error("Ошибка при удалении курса из избранного:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
} 