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
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Требуется авторизация" },
        { status: 401 }
      );
    }

    const courseId = params.id;
    if (!courseId) {
      return NextResponse.json(
        { error: "ID курса обязателен" },
        { status: 400 }
      );
    }

    // Подключаемся к базе данных
    await dbConnect();

    // Находим пользователя
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Проверяем, есть ли курс в избранном
    if (!user.favorites || !user.favorites.includes(courseId)) {
      return NextResponse.json(
        { error: "Курс не найден в избранном" },
        { status: 404 }
      );
    }

    // Удаляем курс из избранного
    user.favorites = user.favorites.filter(
      (id) => id.toString() !== courseId
    );
    await user.save();

    return NextResponse.json({
      message: "Курс удален из избранного",
      courseId,
    });
  } catch (error: any) {
    console.error("Error removing from favorites:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
} 