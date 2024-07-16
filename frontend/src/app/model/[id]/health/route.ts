import { NextRequest, NextResponse } from 'next/server';
import apiClient from '../../../api/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await apiClient.get(`/models/${params.id}/health`);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching model health:', error);
    return NextResponse.json({ error: 'Failed to fetch model health data' }, { status: 500 });
  }
}
