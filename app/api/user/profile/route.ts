import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { z } from "zod";

// Схема валидации для обновления профиля
const updateProfileSchema = z.object({
  name: z.string().min(2, "Имя должно содержать не менее 2 символов").optional(),
});

// GET /api/user/profile - Получить профиль пользователя
export async function GET(req: NextRequest) {
  try {
    // Подключаемся к базе данных
    await dbConnect();

    // Получаем пользователя из базы данных
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email })
      .select("-password -__v");

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Ошибка при получении профиля:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Обновить профиль пользователя
export async function PUT(req: NextRequest) {
  try {
    // Подключаемся к базе данных
    await dbConnect();

    // Получаем пользователя из базы данных
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    // Получаем данные из тела запроса
    const body = await req.json();

    // Валидация данных
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Обновляем только разрешенные поля
    const updateData: { [key: string]: any } = {};
    if (body.name !== undefined) updateData.name = body.name;

    // Если нет данных для обновления, возвращаем ошибку
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Нет данных для обновления" },
        { status: 400 }
      );
    }

    // Обновляем пользователя
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true }
    ).select("-password -__v");

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Профиль успешно обновлен",
      user: updatedUser
    });
  } catch (error: any) {
    console.error("Ошибка при обновлении профиля:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
} 