import { NextResponse } from "next/server";

// Le panier est géré côté client via Zustand + localStorage.
// Cette route est un point d'entrée pour la validation serveur si nécessaire.
export async function GET() {
  return NextResponse.json({ message: "Cart is managed client-side." }, { status: 200 });
}
