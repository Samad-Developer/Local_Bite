"use server"

import { prisma } from "@/lib/prisma"
import { signIn } from "@/auth"
import bcrypt from "bcryptjs"
import { LoginSchema, SignupFormSchema } from "../../validations/auth";
import { Prisma } from "@prisma/client";

// REGISTER
export async function registerOwner(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
 
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    restaurantName: formData.get("restaurantName")
  }

  // Validate form fields
  const validatedFields = SignupFormSchema.safeParse(rawData);

  // If validation fails, return errors
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  
  const { name, email, password, restaurantName } = validatedFields.data

  // check email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: "Email already registered" }
  }

  // create slug from restaurant name
  const slug = restaurantName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")

  // check slug unique
  const existingRestaurant = await prisma.restaurant.findUnique({
    where: { slug },
  })

  if (existingRestaurant) {
    return { error: "Restaurant name already taken" }
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // create restaurant + owner + operating hours together
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const restaurant = await tx.restaurant.create({
      data: {
        name: restaurantName,
        slug,
        cuisineType: "Not set",
        city: "Not set",
        phone: "Not set",
      },
    })

    await tx.operatingHours.createMany({
      data: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
        day,
        isOpen: true,
        openTime: "09:00",
        closeTime: "23:00",
        restaurantId: restaurant.id,
      })),
    })

    await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "OWNER",
        restaurantId: restaurant.id,
      },
    })
  })

  return { success: true }
}

// LOGIN
export async function loginUser(
  prevState: { error?: string } | null | undefined,
  formData: FormData
) {

  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const validatedFields = LoginSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      error : "Invalid email or password",
    }
  }

  const { email, password } = validatedFields.data

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    return { success: true }
    
  } catch {
    return { error: "Invalid email or password" }
  }
}