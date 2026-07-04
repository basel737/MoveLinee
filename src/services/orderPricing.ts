import axios from 'axios';
import { CreateOrderPayload } from '@/lib/api';
import { OrderPriceQuoteResponse } from '@/types/newOrder';
import api from '@/lib/axios';

export const calculateOrderPrice = async (payload: CreateOrderPayload): Promise<number> => {
  try {
    const response = await api.post('/api/orders/calculate-price/', payload);

    const data = response.data as OrderPriceQuoteResponse | number | null | undefined;

    if (typeof data === 'number') {
      return data;
    }

    if (data && typeof data === 'object') {
      const candidate = data as Record<string, unknown>;
      const value = candidate.price ?? candidate.total_price ?? candidate.amount ?? candidate.estimated_price ?? candidate.total;

      if (typeof value === 'number') {
        return value;
      }

      if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
    }

    throw new Error('Backend did not return a valid price');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverMessage = error.response?.data;
      if (typeof serverMessage === 'string') {
        throw new Error(serverMessage);
      }

      if (serverMessage && typeof serverMessage === 'object') {
        const detail = (serverMessage as { detail?: unknown; message?: unknown }).detail;
        const message = (serverMessage as { detail?: unknown; message?: unknown }).message;
        if (typeof detail === 'string') {
          throw new Error(detail);
        }
        if (typeof message === 'string') {
          throw new Error(message);
        }
      }
    }

    const message = error instanceof Error ? error.message : 'Failed to calculate order price';
    throw new Error(message);
  }
};
