import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// PUT /api/user/password - Изменить пароль пользователя
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
    const { currentPassword, newPassword } = body;

    // Валидация данных
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Текущий и новый пароли обязательны" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Новый пароль должен содержать не менее 6 символов" },
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

    // Проверяем текущий пароль
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Текущий пароль неверен" },
        { status: 400 }
      );
    }

    // Хешируем новый пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Обновляем пароль
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ message: "Пароль успешно обновлен" });
  } catch (error: any) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
} 