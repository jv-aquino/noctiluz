import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession(request)
    
    if (!session) {
      return NextResponse.json({ error: 'Não Autenticado' }, { status: 401 })
    }
    
    return NextResponse.json("Autenticado!", { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}