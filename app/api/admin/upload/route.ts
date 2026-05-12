import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const SPRITES_DIR = path.join(process.cwd(), 'public', 'assets', 'sprites');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: PNG, JPEG, GIF, WebP' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 });
    }

    // Preserve original filename or use provided name
    const filename = formData.get('filename') as string || file.name;
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
    const filepath = path.join(SPRITES_DIR, sanitized);

    // Ensure directory exists
    await mkdir(SPRITES_DIR, { recursive: true });

    // Write file
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    return NextResponse.json({
      success: true,
      filename: sanitized,
      path: `/assets/sprites/${sanitized}`,
    });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
