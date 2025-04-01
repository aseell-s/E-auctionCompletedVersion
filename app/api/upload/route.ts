import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    const uploadedPaths: string[] = [];

    // Process each file
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Generate safe filename
      const timestamp = Date.now();
      const safeFilename = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
      const filename = `${timestamp}-${safeFilename}`;
      const relativePath = join('public', 'uploads', filename);
      const absolutePath = join(process.cwd(), relativePath);

      // Ensure upload directory exists
      await mkdir(join(process.cwd(), 'public', 'uploads'), { recursive: true });

      // Write file
      await writeFile(absolutePath, buffer);
      uploadedPaths.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ 
      success: true, 
      paths: uploadedPaths 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'File upload failed' },
      { status: 500 }
    );
  }
}
