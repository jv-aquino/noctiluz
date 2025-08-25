import { NextResponse } from "next/server";
import { toErrorMessage } from "./toErrorMessage";

export async function validBody(request: Request) {
  try {
    const body = await request.json();
    return body;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.json(
      toErrorMessage("Formato de dados inválido - JSON malformado"),
      { status: 400 }
    )
  }
}