import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Course from "@/models/Course";
import mongoose from "mongoose";

// GET /api/user/favorites - получить список избранных курсов пользователя
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }
    
    // Получаем список ID избранных курсов
    const favoriteIds = user.favorites || [];
    
    // Если список пуст, возвращаем пустой массив
    if (favoriteIds.length === 0) {
      return NextResponse.json({ favorites: [] });
    }
    
    // Получаем информацию о курсах
    const favorites = await Course.find({
      _id: { $in: favoriteIds }
    }).select("title description thumbnail slug price level tags");
    
    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Ошибка при получении избранных курсов:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// POST /api/user/favorites - добавить курс в избранное
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    
    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: "ID курса не указан" }, { status: 400 });
    }
    
    // Проверяем, существует ли курс
    const courseExists = await Course.exists({ _id: courseId });
    if (!courseExists) {
      return NextResponse.json({ error: "Курс не найден" }, { status: 404 });
    }
    
    // Добавляем курс в избранное, если его там еще нет
    const user = await User.findOneAndUpdate(
      { email: session.user.email, favorites: { $ne: courseId } },
      { $addToSet: { favorites: courseId } },
      { new: true }
    );
    
    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Курс добавлен в избранное" });
  } catch (error) {
    console.error("Ошибка при добавлении курса в избранное:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
} 