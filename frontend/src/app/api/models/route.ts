import { NextRequest, NextResponse } from 'next/server';
import apiClient from '../../api/client';

export async function GET(request: NextRequest) {
  try {
    const response = await apiClient.get(`/models`);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}
