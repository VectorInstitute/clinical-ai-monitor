import type { NextApiRequest, NextApiResponse } from 'next'
import apiClient from './client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const backendResponse = await apiClient.get('/performance-metrics')
    const html = await backendResponse.text()
    res.setHeader('Content-Type', 'text/html')
    res.status(200).send(html)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch performance metrics' })
  }
}
