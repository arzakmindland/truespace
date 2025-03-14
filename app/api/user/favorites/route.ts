import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Course from "@/models/Course";
import mongoose from "mongoose";

// GET /api/user/favorites - Получить избранные курсы пользователя
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

    // Находим пользователя и его избранные курсы
    const user = await User.findOne({ email: session.user.email }).populate({
      path: "favorites",
      select: "title slug description thumbnail category level duration featured tags",
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({ favorites: user.favorites || [] });
  } catch (error: any) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// POST /api/user/favorites - Добавить курс в избранное
export async function POST(req: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Требуется авторизация" },
        { status: 401 }
      );
    }

    // Получаем ID курса из тела запроса
    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "ID курса обязателен" },
        { status: 400 }
      );
    }

    // Подключаемся к базе данных
    await dbConnect();

    // Проверяем существование курса
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: "Курс не найден" },
        { status: 404 }
      );
    }

    // Находим пользователя
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Проверяем, что курс еще не в избранном
    if (user.favorites && user.favorites.some(id => id.toString() === courseId)) {
      return NextResponse.json(
        { error: "Курс уже в избранном", alreadyFavorite: true },
        { status: 400 }
      );
    }

    // Добавляем курс в избранное
    if (!user.favorites) {
      user.favorites = [new mongoose.Types.ObjectId(courseId)];
    } else {
      user.favorites.push(new mongoose.Types.ObjectId(courseId));
    }
    await user.save();

    return NextResponse.json({
      message: "Курс добавлен в избранное",
      courseId,
    });
  } catch (error: any) {
    console.error("Error adding to favorites:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
} 