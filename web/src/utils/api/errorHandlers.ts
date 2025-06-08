/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZodError } from "zod";
import { NextResponse } from "next/server";

export function returnInvalidDataErrors(validationResult: { error: { errors: any[]; }; }) {
  const errors = validationResult.error.errors.map(err => ({
    campo: err.path.join('.'),
    mensagem: err.message
  }))
  
  return NextResponse.json(
    { 
      error: 'Dados inválidos',
      detalhes: errors
    },
    { status: 400 }
  )
}

export function zodErrorHandler(error: any) {
  if (error instanceof ZodError) {
    const fieldErrors = error.errors.reduce((acc, err) => {
      const field = err.path[0];
      if (!acc[field]) {
        acc[field] = [];
      }
      acc[field].push(err.message);
      return acc;
    }, {} as Record<string, string[]>);

    return NextResponse.json(
      { 
        error: "Dados inválidos",
        fieldErrors,
        messages: error.errors.map(err => err.message)
      },
      { status: 400 }
    );
  }
    
  return NextResponse.json(
    { error: "Erro interno do servidor" },
    { status: 500 }
  );
}