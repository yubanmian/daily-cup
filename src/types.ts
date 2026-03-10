/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DrinkRecord {
  id: number;
  name: string;
  price: number | null;
  calories: number | null;
  rating: number | null;
  notes: string | null;
  image_path: string | null;
  tags: string | null;
  timestamp: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}
