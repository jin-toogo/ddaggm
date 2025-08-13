import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    // 프로젝트 루트의 JSON 파일을 읽기
    const filePath = join(process.cwd(), "clinics_combined.json");
    const fileContent = readFileSync(filePath, "utf-8");
    const clinics = JSON.parse(fileContent);

    return NextResponse.json(clinics);
  } catch (error) {
    console.error("Error reading clinics data:", error);
    return NextResponse.json(
      { error: "Failed to load clinics data" },
      { status: 500 }
    );
  }
}
