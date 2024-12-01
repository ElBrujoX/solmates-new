import { createSwaggerSpec } from 'next-swagger-doc'
import { NextResponse } from 'next/server'

export async function GET() {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'SolMates API Documentation',
        version: '1.0.0',
      },
    },
  })
  return NextResponse.json(spec)
} 