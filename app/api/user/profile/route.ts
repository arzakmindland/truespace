import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// GET /api/user/profile - Получить профиль пользователя
export async function GET(req: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Требуется авторизация" },
        { status: 401 }
      );
    }

    // Подключаемся к базе данных
    await dbConnect();

    // Получаем пользователя из базы данных
    const user = await User.findOne({ email: session.user.email })
      .select("-password")
      .populate({
        path: "enrolledCourses.course",
        select: "title slug thumbnail",
      });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Преобразуем Mongoose документ в обычный объект и удаляем поля, которые не нужны
    const userObject = user.toObject();

    return NextResponse.json({ user: userObject });
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Обновить профиль пользователя
export async function PUT(req: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Требуется авторизация" },
        { status: 401 }
      );
    }

    // Получаем данные из тела запроса
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: "Имя пользователя обязательно" },
        { status: 400 }
      );
    }

    // Подключаемся к базе данных
    await dbConnect();

    // Обновляем пользователя
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { name: name.trim() },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: updatedUser,
      message: "Профиль успешно обновлен",
    });
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
} 