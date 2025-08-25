import { NextRequest, NextResponse } from "next/server";

import { registerSchema } from "@/backend/schemas";
import { returnInvalidDataErrors, toErrorMessage, validBody, zodErrorHandler } from "@/utils/api";
import { findUserByEmail } from "../../services/user";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await validBody(request);
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult);
    }
    
    const validatedData = validationResult.data

    const { name, email, password } = validatedData;

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        toErrorMessage('User com mesmo email já existe'),
        { status: 409 }
      );
    }

    const user = await auth.api.signUpEmail({
      body: { name, email, password, callbackURL: "/" }
    });
    
    return NextResponse.json(
      { user },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    return zodErrorHandler(error);    
  }
}