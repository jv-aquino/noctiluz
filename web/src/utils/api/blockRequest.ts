import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Role } from "@/generated/prisma";
import { toErrorMessage } from "./toErrorMessage";

export async function blockForbiddenRequests(
  request: NextRequest,
  allowedRoles: Role[] | undefined
) {
  const session = await auth.api.getSession(request);

  if (!session?.user) {
    return NextResponse.json(
      toErrorMessage("Não autorizado - Faça login para continuar"),
      { status: 401 }
    );
  }

  const userRole = session.role as Role;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return NextResponse.json(
      toErrorMessage("Acesso negado - Permissões insuficientes"),
      { status: 403 }
    );
  }

  return null;
}
