// - POST API for business registration.
// - Collects company info, contact details, and tax data.
// - Validates input and checks if the email is already used.
// - Prepares and saves business info using Prisma.
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyName,
      email,
      phoneNo,
      companyRegistrationNo,
      address,
      city,
      state,
      postalCode,
      establishmentYear,
      natureOfBusiness,
      panTanNo,
      contactName,
      contactPhoneNo,
      country,
      dob,
      taxId,
    } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash the default password "Welcome"
    const hashedPassword = await bcrypt.hash("Welcome", 10);

    // Create the user with SELLER role
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "SELLER",
        name: contactName,
        isApproved: false, // Sellers need admin approval
        profile: {
          create: {
            email,
            phone: phoneNo,
            companyRegNo: companyRegistrationNo,
            address,
            city,
            state,
            pincode: postalCode,
            establishedAt: new Date(establishmentYear),
            natureOfBusiness,
            panNo: panTanNo,
            contactNo: contactPhoneNo,
            company: companyName,
            country,
            dob: new Date(dob),
            taxId,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json(
      {
        message:
          "Seller registration successful. Please wait for admin approval. Your temporary password is 'Welcome'",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering seller:", {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { message: "Internal server error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
